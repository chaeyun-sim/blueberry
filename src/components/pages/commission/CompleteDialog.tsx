import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileArchive, X, Loader2, FileCheck } from 'lucide-react';
import { OverlayProps } from '@/types/overlay';
import { Commission } from '@/types/commission';
import { useMutation } from '@tanstack/react-query';
import { scoreMutations } from '@/api/score/mutations';
import { scoreKeys } from '@/api/score/queryKeys';
import { findSongByTitle } from '@/api/score';
import { queryClient } from '@/utils/query-client';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { fileTypeConfig, ALLOWED_EXTENSIONS } from '@/constants/file-types';
import { FileEntry } from '@/types/form';
import { MAX_DECOMPRESSED, MAX_FILE_COUNT, MAX_ZIP_SIZE } from '@/constants/file-size';
import { detectFileType } from '@/utils/detect-file-type';
import { formatFileSize } from '@/utils/format-file-size';
import { compressAudioToMp3 } from '@/utils/compress-wav';

const COMPRESS_EXTS = new Set(['wav', 'aif', 'aiff', 'aifc']);

interface CompleteDialogProps extends OverlayProps {
  commission: Commission;
  onConfirm: () => void;
}

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[_\-.,;:()\[\]]/g, ' ').split(/\s+/).filter(Boolean);
}

function expandTokens(tokens: string[]): Set<string> {
  const result = new Set<string>();
  for (const t of tokens) {
    result.add(t);
    const nums = t.match(/\d+/g);
    if (nums) nums.forEach(n => result.add(n));
  }
  return result;
}

const STOP_WORDS = new Set(['in', 'of', 'the', 'a', 'an', 'and', 'for', 'with', 'no']);
const isNum = (s: string) => /^\d+$/.test(s);

export function CompleteDialog({ isOpen, close, commission, onConfirm }: CompleteDialogProps) {
  const zipInputRef = useRef<HTMLInputElement>(null);

  const [zipName, setZipName] = useState<string | null>(null);
  const [zipSize, setZipSize] = useState(0);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createSong } = useMutation(scoreMutations.createSong());
  const { mutateAsync: createArrangement } = useMutation(scoreMutations.createArrangement());
  const { mutateAsync: deleteArrangement } = useMutation(scoreMutations.deleteArrangement());
  const { mutateAsync: uploadFile } = useMutation(scoreMutations.uploadArrangementFile());

  const songTitle = commission.songs?.title ?? commission.title ?? '';
  const composer = commission.songs?.composer ?? commission.composer ?? '';

  const zipBaseName = zipName?.replace(/\.zip$/i, '') ?? '';
  const zipTokenSet = zipBaseName.length > 0 ? expandTokens(tokenize(zipBaseName)) : new Set<string>();
  const composerLastName = composer.trim().split(/\s+/).pop()?.toLowerCase() ?? '';
  const composerMatch = composerLastName.length > 1 && zipTokenSet.has(composerLastName);
  const titleTokenSet = expandTokens(tokenize(songTitle));
  const significantTitleTokens = [...titleTokenSet].filter(t => isNum(t) || (t.length > 2 && !STOP_WORDS.has(t)));
  const titleOverlapCount = significantTitleTokens.filter(t => zipTokenSet.has(t)).length;
  const isZipTitleMatch = zipBaseName.length > 0 && (composerMatch || titleOverlapCount >= 2);

  const resetZip = () => {
    setZipName(null);
    setZipSize(0);
    setFiles([]);
    if (zipInputRef.current) zipInputRef.current.value = '';
  };

  const handleZipFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast.error('ZIP 파일만 업로드할 수 있습니다.');
      if (zipInputRef.current) zipInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_ZIP_SIZE) {
      toast.error('ZIP 파일 크기는 200MB 이하여야 합니다.');
      if (zipInputRef.current) zipInputRef.current.value = '';
      return;
    }

    setIsExtracting(true);
    setZipName(file.name);
    setZipSize(file.size);
    setFiles([]);

    const rawEntries: FileEntry[] = [];
    let aborted = false;

    try {
      const buffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);
      let totalSize = 0;
      let fileCount = 0;

      for (const [path, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue;
        const fileName = path.split('/').pop() ?? path;
        if (fileName.startsWith('.') || path.startsWith('__MACOSX')) continue;
        const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
        if (!ALLOWED_EXTENSIONS.includes(ext)) continue;

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

        rawEntries.push({
          file: new File([blob], fileName),
          label: fileName.replace(/\.[^.]+$/, ''),
          fileType: detectFileType(fileName),
        });
      }
    } catch (e) {
      toast.error('ZIP 파일을 읽을 수 없습니다.', { description: (e as Error).message });
      resetZip();
      setIsExtracting(false);
      return;
    }

    setIsExtracting(false);

    if (aborted) {
      resetZip();
      return;
    }

    const hasAudio = rawEntries.some(e =>
      COMPRESS_EXTS.has(e.file.name.split('.').pop()?.toLowerCase() ?? '')
    );

    if (hasAudio) {
      setIsCompressing(true);
      const processed: FileEntry[] = [];
      for (const entry of rawEntries) {
        const ext = entry.file.name.split('.').pop()?.toLowerCase() ?? '';
        if (COMPRESS_EXTS.has(ext)) {
          try {
            const mp3 = await compressAudioToMp3(entry.file);
            processed.push({ file: mp3, label: entry.label, fileType: 'audio' });
          } catch (e) {
            console.error('[compress] 실패:', entry.file.name, e);
            toast.error(`오디오 변환 실패: ${entry.label}`, { description: (e as Error).message });
            resetZip();
            setIsCompressing(false);
            return;
          }
        } else {
          processed.push(entry);
        }
      }
      setIsCompressing(false);
      setFiles(processed);
    } else {
      setFiles(rawEntries);
    }
  };

  const handleSubmit = async () => {
    if (!zipName || files.length === 0) {
      toast.error('악보 ZIP 파일을 업로드해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. 곡 찾기 or 생성
      let songId: string;
      const existing = await findSongByTitle(songTitle);
      if (existing) {
        songId = existing.id;
      } else {
        const newSong = await createSong({ title: songTitle, composer });
        songId = newSong.id;
      }

      // 2. 편성 생성 (의뢰 연결)
      const arrangement = await createArrangement({
        song_id: songId,
        arrangement: commission.arrangement,
        version: commission.version,
        commission_id: commission.id,
      });

      // 3. 파일 업로드 (악보 + MP3로 변환된 오디오 포함)
      const failed: string[] = [];
      for (const entry of files) {
        try {
          console.log('[upload] 업로드 시작:', entry.file.name, `${(entry.file.size / 1024 / 1024).toFixed(1)}MB`, entry.fileType);
          await uploadFile({ arrangementId: arrangement.id, file: entry.file, label: entry.label, fileType: entry.fileType });
          console.log('[upload] 업로드 완료:', entry.file.name);
        } catch (e) {
          console.error('[upload] 업로드 실패:', entry.file.name, e);
          failed.push(entry.label);
        }
      }

      if (failed.length === files.length) {
        await deleteArrangement({ id: arrangement.id }).catch(() => {});
        toast.error('모든 파일 업로드에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      if (failed.length > 0) toast.error(`업로드 실패: ${failed.join(', ')}`, { description: '실패한 파일은 메일에 포함되지 않아요.' });

      queryClient.invalidateQueries({ queryKey: scoreKeys.list() });

      onConfirm();
      close();
    } catch (e) {
      toast.error('악보 등록에 실패했습니다.', { description: (e as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = isExtracting || isCompressing;
  const processingLabel = isCompressing ? '오디오 MP3 변환 중...' : '압축 해제 중...';

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) close(); }}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle className='font-display'>작업 완료</DialogTitle>
          <DialogDescription>
            완성된 악보 ZIP 파일을 업로드하면 악보 목록에 자동 등록돼요. AIFF/WAV는 MP3로 변환 후 저장됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label className='mb-2 block'>악보 파일 (ZIP)</Label>
            <input
              ref={zipInputRef}
              type='file'
              accept='.zip'
              className='hidden'
              onChange={e => { const f = e.target.files?.[0]; if (f) handleZipFile(f); }}
            />
            {!zipName ? (
              <button
                type='button'
                onClick={() => zipInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleZipFile(f); }}
                className='w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer'
              >
                <FileArchive className='h-8 w-8 text-muted-foreground' />
                <div className='text-center'>
                  <p className='text-sm font-medium'>ZIP 파일을 드래그하거나 클릭하여 업로드</p>
                  <p className='text-xs text-muted-foreground mt-1'>스코어, 파트보, MusicXML, AIFF/WAV 파일이 담긴 ZIP</p>
                </div>
              </button>
            ) : (
              <div className='space-y-2'>
                <div className='flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/15'>
                  <div className='flex items-center gap-3'>
                    <FileArchive className='h-5 w-5 text-primary shrink-0' />
                    <div>
                      <p className='text-sm font-medium truncate max-w-[280px]'>{zipName}</p>
                      <p className='text-xs text-muted-foreground'>
                        {formatFileSize(zipSize)}{files.length > 0 && ` · ${files.length}개 파일`}
                      </p>
                    </div>
                  </div>
                  <button
                    aria-label='파일 제거'
                    onClick={resetZip}
                    disabled={isProcessing || isSubmitting}
                    className='p-1 rounded hover:bg-foreground/5 transition-colors disabled:pointer-events-none'
                  >
                    <X className='h-4 w-4 text-muted-foreground' />
                  </button>
                </div>

                {isProcessing ? (
                  <div className='flex items-center justify-center gap-2 py-4 text-muted-foreground'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm'>{processingLabel}</span>
                  </div>
                ) : (
                  <div className='space-y-1 max-h-36 overflow-y-auto'>
                    {files.map((entry, idx) => {
                      const config = fileTypeConfig[entry.fileType] ?? fileTypeConfig.score;
                      const Icon = config.icon;
                      return (
                        <div key={idx} className='flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 text-sm'>
                          <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                          <span className='flex-1 truncate'>{entry.label}</span>
                          <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground'>{config.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isProcessing && zipBaseName && !isZipTitleMatch && (
                  <p className='text-xs text-destructive px-1'>
                    ZIP 파일명이 곡명 또는 작곡가명과 일치하지 않습니다.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className='grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 text-sm'>
            <div>
              <p className='text-xs text-muted-foreground mb-0.5'>곡명</p>
              <p className='font-medium truncate'>{songTitle}</p>
            </div>
            <div>
              <p className='text-xs text-muted-foreground mb-0.5'>작곡가</p>
              <p className='font-medium truncate'>{composer || '-'}</p>
            </div>
            <div className='col-span-2'>
              <p className='text-xs text-muted-foreground mb-0.5'>편성</p>
              <p className='font-medium'>{commission.arrangement}</p>
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-2 pt-2'>
          <Button
            variant='outline'
            onClick={() => { resetZip(); close(); }}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isProcessing || !zipName || files.length === 0 || !isZipTitleMatch}
            className='gap-2'
          >
            {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin' /> : <FileCheck className='h-4 w-4' />}
            {isSubmitting ? '등록 중...' : '작업 완료'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
