import { ElementType, useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileArchive,
  X,
  Plus,
  ArrowLeft,
  FileMusic,
  FileAudio,
  FileText,
  File as FileIcon,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@/components/Autocomplete';
import { ALL_INSTRUMENTS, INSTRUMENT_ABBREVIATIONS } from '@/constants/instruments';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scoreQueries } from '@/api/score/queries';
import { scoreMutations } from '@/api/score/mutations';
import { scoreKeys } from '@/api/score/queryKeys';
import { findSongByTitle } from '@/api/score';
import { toast } from 'sonner';
import JSZip from 'jszip';

interface FileEntry {
  file: File;
  label: string;
  fileType: string;
}

const fileTypeConfig: Record<
  string,
  { icon: ElementType; label: string; color: string; dot: string }
> = {
  score: { icon: FileMusic, label: '스코어', color: 'text-primary', dot: 'hsl(var(--primary))' },
  part: {
    icon: FileMusic,
    label: '파트보',
    color: 'text-[hsl(var(--status-working))]',
    dot: 'hsl(var(--status-working))',
  },
  audio: {
    icon: FileAudio,
    label: '오디오',
    color: 'text-[hsl(var(--warning))]',
    dot: 'hsl(var(--warning))',
  },
  musicxml: {
    icon: FileText,
    label: 'MusicXML',
    color: 'text-[hsl(var(--success))]',
    dot: 'hsl(var(--success))',
  },
  pdf: {
    icon: FileIcon,
    label: 'PDF',
    color: 'text-muted-foreground',
    dot: 'hsl(var(--muted-foreground))',
  },
};

function detectFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['wav', 'mp3', 'm4a', 'flac', 'aiff'].includes(ext)) return 'audio';
  if (['xml', 'musicxml', 'mxl'].includes(ext)) return 'musicxml';
  if (ext === 'pdf') return 'pdf';
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  if (nameWithoutExt.includes(' - ')) return 'part';
  return 'score';
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const hasRomanSuffix = (name: string) => /\s+(I{1,3}V?|IV|VI{0,3}|V)$/.test(name);

function buildInstrumentList(names: string[]) {
  const result: string[] = [];
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  for (const name of names) {
    const sameBase = result.filter(i => i === name || i.startsWith(name + ' '));
    if (sameBase.length === 0) {
      result.push(name);
    } else if (sameBase.length === 1 && !hasRomanSuffix(sameBase[0])) {
      const idx = result.indexOf(name);
      result[idx] = `${name} I`;
      result.push(`${name} II`);
    } else {
      const nextNum = sameBase.length + 1;
      result.push(`${name} ${roman[nextNum - 1] || nextNum}`);
    }
  }
  return result;
}

const ABBR_TO_INSTRUMENT = Object.fromEntries(
  Object.entries(INSTRUMENT_ABBREVIATIONS).map(([full, abbr]) => [abbr.toLowerCase(), full]),
);

function parseInstrumentsFromZipName(fileName: string): string[] {
  const name = fileName.replace(/\.zip$/i, '');
  const lastSep = Math.max(name.lastIndexOf('-'), name.lastIndexOf('_'));
  if (lastSep === -1) return [];

  const result: string[] = [];
  for (const part of name.slice(lastSep + 1).split(',')) {
    const trimmed = part.trim().toLowerCase();
    const match = trimmed.match(/^(\d+)(.+)$/);
    if (match) {
      const instrument = ABBR_TO_INSTRUMENT[match[2]];
      if (instrument) {
        const count = parseInt(match[1]);
        for (let i = 0; i < count; i++) result.push(instrument);
      }
    } else {
      const instrument = ABBR_TO_INSTRUMENT[trimmed];
      if (instrument) result.push(instrument);
    }
  }
  return result;
}

const ScoreRegister = () => {
  const navigate = useNavigate();
  const zipInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: songs = [] } = useQuery(scoreQueries.getSongs());

  const [songTitle, setSongTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [instruments, setInstruments] = useState<string[]>([]);
  const [version, setVersion] = useState<string | null>(null);
  const [zipName, setZipName] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState(0);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [instrumentInput, setInstrumentInput] = useState('');
  const [showInstrumentDropdown, setShowInstrumentDropdown] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const songSuggestions = songs.map(s => s.title);
  const composerSuggestions = [...new Set(songs.map(s => s.composer).filter(Boolean))];

  const filteredInstruments = ALL_INSTRUMENTS.filter(opt =>
    opt.toLowerCase().includes(instrumentInput.toLowerCase()),
  );

  const handleSongSelect = (value: string) => {
    setSongTitle(value);
    const match = songs.find(s => s.title === value);
    if (match) setComposer(match.composer);
  };

  const handleAddInstrument = (name: string) => {
    setInstruments(prev => buildInstrumentList([...prev, name]));
    setInstrumentInput('');
    setShowInstrumentDropdown(false);
  };

  const removeInstrument = (index: number) => {
    const removed = instruments[index];
    const baseName = removed.replace(/ (I{1,3}V?|IV|V|VI{0,3})$/, '');
    const remaining = instruments.filter((_, i) => i !== index);
    const sameBase = remaining.filter(i => i === baseName || i.startsWith(baseName + ' '));
    if (sameBase.length === 1 && hasRomanSuffix(sameBase[0])) {
      setInstruments(
        remaining.map(i => (i === baseName || i.startsWith(baseName + ' ') ? baseName : i)),
      );
    } else {
      setInstruments(remaining);
    }
  };

  const MAX_ZIP_SIZE = 200 * 1024 * 1024; // 200MB
  const MAX_DECOMPRESSED = 500 * 1024 * 1024; // 500MB
  const MAX_FILE_COUNT = 100;

  const handleZipFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast.error('ZIP 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > MAX_ZIP_SIZE) {
      toast.error('ZIP 파일 크기는 200MB 이하여야 합니다.');
      return;
    }

    setIsExtracting(true);
    setZipName(file.name);
    setZipSize(file.size);
    setFiles([]);

    try {
      const buffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);
      const entries: FileEntry[] = [];

      let totalSize = 0;
      let fileCount = 0;
      let aborted = false;

      for (const [path, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue;
        const fileName = path.split('/').pop() ?? path;
        if (fileName.startsWith('.') || path.startsWith('__MACOSX')) continue;
        if (detectFileType(fileName) === 'audio') continue;

        fileCount++;
        if (fileCount > MAX_FILE_COUNT) {
          toast.error('ZIP 내 파일이 100개를 초과합니다.');
          aborted = true;
          break;
        }

        const blob = await entry.async('blob');
        totalSize += blob.size;
        if (totalSize > MAX_DECOMPRESSED) {
          toast.error('압축 해제 크기가 500MB를 초과합니다.');
          aborted = true;
          break;
        }

        const extractedFile = new File([blob], fileName);
        entries.push({
          file: extractedFile,
          label: fileName.replace(/\.[^.]+$/, ''),
          fileType: detectFileType(fileName),
        });
      }

      if (!aborted) {
        setFiles(entries);

        const parsed = parseInstrumentsFromZipName(file.name);
        if (parsed.length > 0) {
          setInstruments(buildInstrumentList(parsed));
        } else {
          toast.info('악기 정보를 자동으로 인식하지 못했습니다. 직접 입력해주세요.');
        }
      } else {
        setZipName(null);
      }
    } catch (e) {
      console.error('ZIP extraction error:', e);
      toast.error('ZIP 파일을 읽을 수 없습니다.', { description: (e as Error).message });
      setZipName(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleZipDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleZipFile(file);
  };

  const clearZip = () => {
    setZipName(null);
    setZipSize(0);
    setFiles([]);
    setInstruments([]);
    setSongTitle('');
    setComposer('');
    setVersion(null);
    if (zipInputRef.current) zipInputRef.current.value = '';
  };

  const { mutateAsync: createSong } = useMutation(scoreMutations.createSong());
  const { mutateAsync: createArrangement } = useMutation(scoreMutations.createArrangement());
  const { mutateAsync: uploadFile } = useMutation(scoreMutations.uploadArrangementFile());

  const handleSubmit = async () => {
    if (!songTitle.trim()) {
      toast.error('곡명을 입력해주세요.');
      return;
    }
    if (instruments.length === 0) {
      toast.error('악기 편성을 입력해주세요.');
      return;
    }
    if (files.length === 0) {
      toast.error('악보 파일이 없습니다. ZIP 파일을 먼저 업로드해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Find or create song
      let songId: string;
      try {
        const existing = await findSongByTitle(songTitle);
        if (existing) {
          songId = existing.id;
        } else {
          const newSong = await createSong({ title: songTitle.trim(), composer: composer.trim() });
          songId = newSong.id;
        }
      } catch (e) {
        setIsSubmitting(false);
        toast.error('곡명 검색에 실패했습니다.', { description: (e as Error).message });
        return;
      }

      // 2. Create arrangement
      const newArrangement = await createArrangement(
        {
          song_id: songId,
          arrangement: instruments.join(', '),
          version: version ?? undefined,
        },
        {
          onError: error => {
            setIsSubmitting(false);
            toast.error('편성 등록에 실패했습니다.', { description: (error as Error).message });
          },
        },
      );

      // 3. Upload files
      const failed: string[] = [];
      for (const entry of files) {
        try {
          await uploadFile(
            {
              arrangementId: newArrangement.id,
              file: entry.file,
              label: entry.label,
              fileType: entry.fileType,
            },
            {
              onError: error => {
                setIsSubmitting(false);
                toast.error('파일 업로드에 실패했습니다.', {
                  description: (error as Error).message,
                });
              },
            },
          );
        } catch {
          failed.push(entry.label);
        }
      }

      if (failed.length > 0) {
        toast.warning(`일부 파일 업로드 실패: ${failed.join(', ')}`);
      }

      queryClient.invalidateQueries({ queryKey: scoreKeys.list() });
      toast.success('악보가 등록되었습니다.');
      clearZip();
    } catch (e) {
      toast.error('악보 등록에 실패했습니다.', { description: (e as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className='mb-6'>
        <Button
          variant='ghost'
          className='gap-2 text-muted-foreground hover:bg-foreground/5'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='h-4 w-4' /> 뒤로
        </Button>
      </div>
      <PageHeader
        title='악보 추가'
        description='새로운 악보를 등록합니다'
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left: ZIP Upload */}
        <Card className='border-border/50'>
          <CardContent className='p-5'>
            <h2 className='font-display font-semibold mb-4'>악보 파일</h2>
            <input
              ref={zipInputRef}
              type='file'
              accept='.zip'
              className='hidden'
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleZipFile(file);
              }}
            />

            {!zipName ? (
              <div
                onClick={() => zipInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={handleZipDrop}
                className='min-h-[300px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer'
              >
                <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
                  <FileArchive className='h-8 w-8 text-muted-foreground' />
                </div>
                <div className='text-center'>
                  <p className='font-medium'>ZIP 파일을 드래그하거나 클릭하여 업로드</p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    스코어, 파트보, MusicXML 파일이 담긴 ZIP
                  </p>
                </div>
              </div>
            ) : (
              <div className='space-y-3'>
                {/* ZIP header */}
                <div className='flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/15'>
                  <div className='flex items-center gap-3'>
                    <FileArchive className='h-5 w-5 text-primary shrink-0' />
                    <div>
                      <p className='text-sm font-medium truncate max-w-[200px]'>{zipName}</p>
                      <p className='text-xs text-muted-foreground'>
                        {formatFileSize(zipSize)}
                        {files.length > 0 && ` · ${files.length}개 파일`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearZip}
                    disabled={isExtracting || isSubmitting}
                    className='p-1 rounded hover:bg-foreground/5 transition-colors disabled:pointer-events-none'
                  >
                    <X className='h-4 w-4 text-muted-foreground' />
                  </button>
                </div>

                {/* Extracted file list */}
                {isExtracting ? (
                  <div className='flex items-center justify-center gap-2 py-8 text-muted-foreground'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm'>압축 해제 중...</span>
                  </div>
                ) : (
                  <div className='space-y-1.5'>
                    {files.map((entry, idx) => {
                      const config = fileTypeConfig[entry.fileType] ?? fileTypeConfig.score;
                      const Icon = config.icon;
                      return (
                        <div
                          key={idx}
                          className='flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group'
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                          <input
                            className='flex-1 min-w-0 text-sm bg-transparent outline-none border-b border-transparent hover:border-border focus:border-primary transition-colors'
                            value={entry.label}
                            onChange={e =>
                              setFiles(prev =>
                                prev.map((f, i) =>
                                  i === idx ? { ...f, label: e.target.value } : f,
                                ),
                              )
                            }
                            disabled={isSubmitting}
                          />
                          <span className='text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium shrink-0'>
                            {config.label}
                          </span>
                          <span className='text-xs text-muted-foreground tabular-nums shrink-0'>
                            {formatFileSize(entry.file.size)}
                          </span>
                          <button
                            type='button'
                            onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                            disabled={isSubmitting}
                            className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive disabled:pointer-events-none'
                          >
                            <X className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* File type summary */}
                {files.length > 0 && (
                  <div className='flex flex-wrap gap-2 pt-2 border-t border-border/50'>
                    {Object.entries(fileTypeConfig).map(([key, config]) => {
                      const count = files.filter(f => f.fileType === key).length;
                      if (count === 0) return null;
                      return (
                        <span
                          key={key}
                          className='text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground flex items-center gap-1'
                        >
                          <span
                            className='w-1.5 h-1.5 rounded-full'
                            style={{ backgroundColor: config.dot }}
                          />
                          {config.label} {count}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Form */}
        <Card className='border-border/50'>
          <CardContent className='p-5'>
            <h2 className='font-display font-semibold mb-4'>악보 정보</h2>
            <div className='space-y-5'>
              <div className='space-y-2'>
                <Label>곡명</Label>
                <Autocomplete
                  value={songTitle}
                  onChange={handleSongSelect}
                  suggestions={songSuggestions}
                  placeholder='곡명을 입력하세요'
                  inputProps={{ disabled: isSubmitting }}
                />
              </div>

              <div className='space-y-2'>
                <Label>작곡가</Label>
                <Autocomplete
                  value={composer}
                  onChange={setComposer}
                  suggestions={composerSuggestions}
                  placeholder='작곡가를 입력하세요'
                  inputProps={{ disabled: isSubmitting }}
                />
              </div>

              {/* Instrument Chips */}
              <div className='space-y-2'>
                <Label>악기 구성</Label>
                <div className='relative'>
                  <Input
                    placeholder='악기를 검색하여 추가...'
                    value={instrumentInput}
                    onChange={e => {
                      setInstrumentInput(e.target.value);
                      setShowInstrumentDropdown(true);
                    }}
                    onFocus={() => setShowInstrumentDropdown(true)}
                    onBlur={() => setTimeout(() => setShowInstrumentDropdown(false), 200)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddInstrument(instrumentInput);
                    }}
                    disabled={isSubmitting}
                  />
                  {showInstrumentDropdown && instrumentInput && filteredInstruments.length > 0 && (
                    <div className='absolute z-10 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto'>
                      {filteredInstruments.map(opt => (
                        <button
                          key={opt}
                          type='button'
                          className='w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2'
                          onMouseDown={e => {
                            e.preventDefault();
                            handleAddInstrument(opt);
                          }}
                        >
                          <Plus className='h-3 w-3 text-muted-foreground' />
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {instruments.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {instruments.map((inst, idx) => (
                      <span
                        key={idx}
                        className='inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary border border-primary/20'
                      >
                        {inst}
                        <button
                          type='button'
                          disabled={isSubmitting}
                          onClick={() => removeInstrument(idx)}
                          className='ml-0.5 hover:text-destructive transition-colors disabled:opacity-50 disabled:pointer-events-none'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label>버전</Label>
                <Select
                  value={version ?? 'normal'}
                  onValueChange={v => setVersion(v === 'normal' ? null : v)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='normal'>-</SelectItem>
                    <SelectItem value='easy'>Easy</SelectItem>
                    <SelectItem value='hard'>Hard</SelectItem>
                    <SelectItem value='pro'>Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex pt-2'>
                <Button
                  className='flex-1'
                  onClick={handleSubmit}
                  disabled={isSubmitting || isExtracting || !songTitle.trim()}
                >
                  {isSubmitting ? '등록 중...' : '악보 등록'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ScoreRegister;
