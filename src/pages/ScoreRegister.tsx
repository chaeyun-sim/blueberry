import { useState, useRef } from 'react';
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
import { FileArchive, X, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@/components/Autocomplete';
import { ALL_INSTRUMENTS } from '@/constants/instruments';
import { useMutation, useQuery } from '@tanstack/react-query';
import { scoreQueries } from '@/api/score/queries';
import { scoreMutations } from '@/api/score/mutations';
import { scoreKeys } from '@/api/score/queryKeys';
import { findSongByTitle } from '@/api/score';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { queryClient } from '@/utils/query-client';
import { buildInstrumentList, hasRomanSuffix } from '@/utils/build-instrument-list';
import { DifficultyLevelType } from '@/types/commission';
import { parseInstrumentsFromZipName } from '@/utils/parse-instruments-from-zipName';
import { formatFileSize } from '@/utils/format-file-size';
import { detectFileType } from '@/utils/detect-file-type';
import { fileTypeConfig } from '@/constants/file-types';
import { FileEntry } from '@/types/form';


interface ScoreRegisterFormType {
  songTitle: string;
  composer: string;
  instruments: string[];
  version: string | null;
  zipName: string | null;
  zipSize: number;
  files: FileEntry[];
  instrumentInput: string;
  showInstrumentDropdown: boolean;
}

const ScoreRegister = () => {
  const navigate = useNavigate();
  const zipInputRef = useRef<HTMLInputElement>(null);

  const { data: songs = [] } = useQuery(scoreQueries.getSongs());

  const [form, setForm] = useState<ScoreRegisterFormType>({
    songTitle: '',
    composer: '',
    instruments: [],
    version: null,
    zipName: null,
    zipSize: 0,
    files: [],
    instrumentInput: '',
    showInstrumentDropdown: false,
  })
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const songSuggestions = songs.map(s => s.title);
  const composerSuggestions = [...new Set(songs.map(s => s.composer).filter(Boolean))];

  const filteredInstruments = ALL_INSTRUMENTS.filter(opt =>
    opt.toLowerCase().includes(form.instrumentInput.toLowerCase()),
  );

  const handleSongSelect = (value: string) => {
    const match = songs.find(s => s.title === value);
    setForm(prev => ({ ...prev, songTitle: value, ...(match ? { composer: match.composer } : {}) }));
  };

  const handleAddInstrument = (name: string) => {
    setForm(prev => ({ ...prev, instruments: buildInstrumentList([...prev.instruments, name]), instrumentInput: '', showInstrumentDropdown: false }));
  };

  const removeInstrument = (index: number) => {
    setForm(prev => {
      const removed = prev.instruments[index];
      const baseName = removed.replace(/ (I{1,3}V?|IV|V|VI{0,3})$/, '');
      const remaining = prev.instruments.filter((_, i) => i !== index);
      const sameBase = remaining.filter(i => i === baseName || i.startsWith(baseName + ' '));
      const instruments = sameBase.length === 1 && hasRomanSuffix(sameBase[0])
        ? remaining.map(i => (i === baseName || i.startsWith(baseName + ' ') ? baseName : i))
        : remaining;
      return { ...prev, instruments };
    });
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
    setForm(prev => ({ ...prev, zipName: file.name, zipSize: file.size, files: [] }));

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
        const parsed = parseInstrumentsFromZipName(file.name);
        setForm(prev => ({
          ...prev,
          files: entries,
          ...(parsed.length > 0 ? { instruments: buildInstrumentList(parsed) } : {}),
        }));
        if (parsed.length === 0) {
          toast.info('악기 정보를 자동으로 인식하지 못했습니다. 직접 입력해주세요.');
        }
      } else {
        setForm(prev => ({ ...prev, zipName: null }));
      }
    } catch (e) {
      toast.error('ZIP 파일을 읽을 수 없습니다.', { description: (e as Error).message });
      setForm(prev => ({ ...prev, zipName: null }));
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
    setForm(prev => ({ ...prev, zipName: null, zipSize: 0, files: [], instruments: [], songTitle: '', composer: '', version: null }));
    if (zipInputRef.current) zipInputRef.current.value = '';
  };

  const { mutateAsync: createSong } = useMutation(scoreMutations.createSong());
  const { mutateAsync: createArrangement } = useMutation(scoreMutations.createArrangement());
  const { mutateAsync: uploadFile } = useMutation(scoreMutations.uploadArrangementFile());

  const handleSubmit = async () => {
    if (!form.songTitle.trim()) {
      toast.error('곡명을 입력해주세요.');
      return;
    }
    if (form.instruments.length === 0) {
      toast.error('악기 편성을 입력해주세요.');
      return;
    }
    if (form.files.length === 0) {
      toast.error('악보 파일이 없습니다. ZIP 파일을 먼저 업로드해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Find or create song
      let songId: string | undefined;
      try {
        const existing = await findSongByTitle(form.songTitle.trim());
        if (existing) {
          songId = existing.id;
        } else {
          const newSong = await createSong({ title: form.songTitle.trim(), composer: form.composer.trim() });
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
          arrangement: form.instruments.join(', '),
          version: form.version ?? undefined,
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
      for (const entry of form.files) {
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

            {!form.zipName ? (
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
                      <p className='text-sm font-medium truncate max-w-[200px]'>{form.zipName}</p>
                      <p className='text-xs text-muted-foreground'>
                        {formatFileSize(form.zipSize)}
                        {form.files.length > 0 && ` · ${form.files.length}개 파일`}
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
                    {form.files.map((entry, idx) => {
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
                              setForm(prev => ({ ...prev, files: prev.files.map((f, i) => i === idx ? { ...f, label: e.target.value } : f) }))
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
                            onClick={() => setForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))}
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
                {form.files.length > 0 && (
                  <div className='flex flex-wrap gap-2 pt-2 border-t border-border/50'>
                    {Object.entries(fileTypeConfig).map(([key, config]) => {
                      const count = form.files.filter(f => f.fileType === key).length;
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
                  value={form.songTitle}
                  onChange={handleSongSelect}
                  suggestions={songSuggestions}
                  placeholder='곡명을 입력하세요'
                  inputProps={{ disabled: isSubmitting }}
                />
              </div>

              <div className='space-y-2'>
                <Label>작곡가</Label>
                <Autocomplete
                  value={form.composer}
                  onChange={value => setForm(prev => ({ ...prev, composer: value }))}
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
                    value={form.instrumentInput}
                    onChange={e => {
                      setForm(prev => ({ ...prev, instrumentInput: e.target.value, showInstrumentDropdown: true }));
                    }}
                    onFocus={() => setForm(prev => ({ ...prev, showInstrumentDropdown: true }))}
                    onBlur={() => setTimeout(() => setForm(prev => ({ ...prev, showInstrumentDropdown: false })), 200)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddInstrument(form.instrumentInput);
                    }}
                    disabled={isSubmitting}
                  />
                  {form.showInstrumentDropdown && form.instrumentInput && filteredInstruments.length > 0 && (
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
                {form.instruments.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {form.instruments.map((inst, idx) => (
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
                  value={form.version ?? 'normal'}
                  onValueChange={v => setForm(prev => ({ ...prev, version: v === 'normal' ? null : v as DifficultyLevelType }))}
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
                  disabled={isSubmitting || isExtracting || !form.songTitle.trim()}
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
