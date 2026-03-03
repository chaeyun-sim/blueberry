import { useState, useRef, DragEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, FileCheck } from 'lucide-react';
import { OverlayProps } from '@/types/overlay';
import { Commission } from '@/types/commission';
import { useMutation } from '@tanstack/react-query';
import { scoreMutations } from '@/api/score/mutations';
import { scoreKeys } from '@/api/score/queryKeys';
import { findSongByTitle } from '@/api/score';
import { queryClient } from '@/utils/query-client';
import { toast } from 'sonner';
import { FileEntry } from '@/types/form';
import { MAX_ZIP_SIZE } from '@/constants/file-size';
import { extractZipEntries, ZipExtractionError } from '@/utils/extract-zip-entries';
import { matchesZipTitle } from '@/utils/match-zip-title';
import { hasCompressibleAudio, compressAudioEntries } from '@/utils/compress-audio-entries';
import DropZone from './Dropzone';
import ZipFileHeader from './ZipFileHeader';
import ReadOnlyFileList from './ReadOnlyFileList';
import { useAuth } from '@/provider/AuthProvider';

async function findOrCreateSong(
  title: string,
  composer: string,
  createSong: (params: { title: string; composer: string }) => Promise<{ id: string }>,
): Promise<string> {
  const existing = await findSongByTitle(title, composer);
  if (existing) return existing.id;
  const newSong = await createSong({ title, composer });
  return newSong.id;
}

async function uploadAllFiles(
  files: FileEntry[],
  arrangementId: string,
  uploadFile: (params: { arrangementId: string; file: File; label: string; fileType: string }) => Promise<unknown>,
): Promise<string[]> {
  const failed: string[] = [];
  for (const entry of files) {
    try {
      await uploadFile({ arrangementId, file: entry.file, label: entry.label, fileType: entry.fileType });
    } catch (e) {
      toast.error('파일 업로드에 실패했습니다.', { description: (e as Error).message });
      failed.push(entry.label);
    }
  }
  return failed;
}

interface CompleteDialogForm {
  zipName: string | null;
  zipSize: number | null;
  files: FileEntry[];
}

interface CompleteDialogProps extends OverlayProps {
  commission: Commission;
  onConfirm: () => void;
}

export function CompleteDialog({ isOpen, close, commission, onConfirm }: CompleteDialogProps) {
  const zipInputRef = useRef<HTMLInputElement>(null);
  const { isGuest } = useAuth();

  const [form, setForm] = useState<CompleteDialogForm>({
    zipName: null,
    zipSize: null,
    files: []
  })

  const [isExtracting, setIsExtracting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createSong } = useMutation(scoreMutations.createSong());
  const { mutateAsync: createArrangement } = useMutation(scoreMutations.createArrangement());
  const { mutateAsync: deleteArrangement } = useMutation(scoreMutations.deleteArrangement());
  const { mutateAsync: uploadFile } = useMutation(scoreMutations.uploadArrangementFile());

  const songTitle = commission.songs?.title ?? commission.title ?? '';
  const composer = commission.songs?.composer ?? commission.composer ?? '';
  const isZipTitleMatch = form.zipName ? matchesZipTitle(form.zipName, songTitle, composer) : false;
  const isProcessing = isExtracting || isCompressing;

  const resetZip = () => {
    setForm(prev => ({ ...prev, zipName: null, zipSize: 0, files: [] }));
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

    setForm(prev => ({ ...prev, zipName: file.name, zipSize: file.size, files: [] }));
    setIsExtracting(true);

    let rawEntries: FileEntry[];
    try {
      const buffer = await file.arrayBuffer();
      rawEntries = await extractZipEntries(buffer);
    } catch (e) {
      const msg = e instanceof ZipExtractionError ? e.message : 'ZIP 파일을 읽을 수 없습니다.';
      toast.error(msg, e instanceof ZipExtractionError ? undefined : { description: (e as Error).message });
      resetZip();
      return;
    } finally {
      setIsExtracting(false);
    }

    if (!hasCompressibleAudio(rawEntries)) {
      setForm(prev => ({ ...prev, files: rawEntries }));
      return;
    }

    setIsCompressing(true);
    try {
      const res = await compressAudioEntries(rawEntries)
      setForm(prev => ({ ...prev, files: res as FileEntry[] }));
    } catch (e) {
      toast.error('오디오 변환에 실패했습니다.', { description: (e as Error).message });
      resetZip();
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async () => {
    if (isGuest) {
      toast.error('게스트 모드에서는 악보를 등록할 수 없습니다.');
      return;
    }

    if (!form.zipName || form.files.length === 0) {
      toast.error('악보 ZIP 파일을 업로드해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const songId = await findOrCreateSong(songTitle, composer, createSong);

      const arrangement = await createArrangement({
        song_id: songId,
        arrangement: commission.arrangement,
        version: commission.version,
        commission_id: commission.id,
      });

      const failed = await uploadAllFiles(form.files, arrangement.id, uploadFile);

      if (failed.length === form.files.length) {
        await deleteArrangement({ id: arrangement.id }).catch(() => {});
        toast.error('모든 파일 업로드에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      if (failed.length > 0) {
        toast.error(`업로드 실패: ${failed.join(', ')}`, { description: '실패한 파일은 메일에 포함되지 않아요.' });
      }

      queryClient.invalidateQueries({ queryKey: scoreKeys.list() });
      onConfirm();
      close();
    } catch (e) {
      toast.error('악보 등록에 실패했습니다.', { description: (e as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleZipFile(f);
  };

  const canSubmit = !isSubmitting && !isProcessing && !!form.zipName && form.files.length > 0 && isZipTitleMatch;

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

            {!form.zipName ? (
              <DropZone
                onClick={() => zipInputRef.current?.click()}
                onDrop={handleDrop}
              />
            ) : (
              <div className='space-y-2'>
                <ZipFileHeader
                  name={form.zipName}
                  size={form.zipSize}
                  fileCount={form.files.length}
                  onClear={resetZip}
                  disabled={isProcessing || isSubmitting}
                />

                {isProcessing ? (
                    <div className='flex items-center justify-center gap-2 py-4 text-muted-foreground'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      <span className='text-sm'>{isCompressing ? '오디오 MP3 변환 중...' : '압축 해제 중...'}</span>
                    </div>
                ) : (
                  <ReadOnlyFileList files={form.files} />
                )}

                {!isProcessing && form.zipName && !isZipTitleMatch && (
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
          <Button onClick={handleSubmit} disabled={!canSubmit} className='gap-2'>
            {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin' /> : <FileCheck className='h-4 w-4' />}
            {isSubmitting ? '등록 중...' : '작업 완료'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}