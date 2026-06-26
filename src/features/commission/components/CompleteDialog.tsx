import { useState, DragEvent, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button';
import Label from '@/components/ui/label';
import { Loader2, FileCheck, Sparkles } from 'lucide-react';
import { OverlayProps } from '@/types/overlay';
import { Commission } from '../types';
import { useMutation } from '@tanstack/react-query';
import { scoreMutations, scoreKeys, findOrCreateSong, uploadAllFiles } from '@/features/score/api';
import { queryClient } from '@/utils/query-client';
import { toast } from 'sonner';
import { matchesZipTitle } from '@/utils/match-zip-title';
import { checkZipMatchAI } from '@/utils/check-zip-match-ai';
import { validateZipFiles } from '@/utils/validate-zip-files';
import { DropZone, ZipFileHeader, ReadOnlyFileList } from '@/features/commission/components';
import { Input } from '@/components/ui/input';
import { useZipFileHandler } from '@/hooks/use-zip-file-handler';

type MatchState = 'idle' | 'heuristic-match' | 'checking-ai' | 'ai-match' | 'no-match' | 'ai-error';

interface CompleteDialogProps extends OverlayProps {
  commission: Commission;
  onConfirm: () => void;
}

export function CompleteDialog({ isOpen, close, commission, onConfirm }: CompleteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceOverride, setForceOverride] = useState(false);
  const [matchState, setMatchState] = useState<MatchState>('idle');

  const {
    zipInputRef,
    zipName,
    zipSize,
    files,
    isExtracting,
    isCompressing,
    reset: resetZip,
    handleZipFile,
  } = useZipFileHandler();

  const { mutateAsync: createSong } = useMutation(scoreMutations.createSong());
  const { mutateAsync: createArrangement } = useMutation(scoreMutations.createArrangement());
  const { mutateAsync: deleteArrangement } = useMutation(scoreMutations.deleteArrangement());
  const { mutateAsync: uploadFile } = useMutation(scoreMutations.uploadArrangementFile());

  const songTitle = commission.songs?.title ?? commission.title ?? '';
  const composer = commission.songs?.composer ?? commission.composer ?? '';
  const isProcessing = isExtracting || isCompressing;

  useEffect(() => {
    if (!zipName || isProcessing) {
      setMatchState('idle');
      return;
    }

    if (matchesZipTitle(zipName, songTitle, composer)) {
      setMatchState('heuristic-match');
      return;
    }

    setMatchState('checking-ai');
    checkZipMatchAI(zipName, songTitle, composer, commission.arrangement, commission.version)
      .then(match => setMatchState(match ? 'ai-match' : 'no-match'))
      .catch((e) => { console.error('[AI check error]', e); setMatchState('ai-error'); });
  }, [zipName, isProcessing, songTitle, composer, commission.arrangement]);

  const isZipTitleMatch =
    matchState === 'heuristic-match' || matchState === 'ai-match';

  const fileValidation =
    files.length > 0 && !isProcessing
      ? validateZipFiles(files, commission.arrangement)
      : null;

  const handleSubmit = async () => {
    if (!zipName || files.length === 0) {
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

      const failed = await uploadAllFiles(files, arrangement.id, uploadFile);

      if (failed.length === files.length) {
        await deleteArrangement({ id: arrangement.id }).catch(() => {});
        toast.error('모든 파일 업로드에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      if (failed.length > 0) {
        toast.error(`업로드 실패: ${failed.join(', ')}`, {
          description: '실패한 파일은 메일에 포함되지 않아요.',
        });
      }

      queryClient.invalidateQueries({ queryKey: scoreKeys.list() });
      queryClient.invalidateQueries({ queryKey: scoreKeys.summary() });
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

  const isFileValid = fileValidation?.valid ?? true;

  const canSubmit =
    !isSubmitting &&
    !isProcessing &&
    matchState !== 'checking-ai' &&
    !!zipName &&
    files.length > 0 &&
    (isZipTitleMatch || matchState === 'ai-error' || forceOverride) &&
    (isFileValid || forceOverride);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      resetZip();
      close();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle className='font-display'>작업 완료</DialogTitle>
          <DialogDescription>
            완성된 악보 ZIP 파일을 업로드하면 악보 목록에 자동 등록돼요. AIFF/WAV는 MP3로 변환 후
            저장됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label
              htmlFor='zip-input'
              className='mb-2 block'
            >
              악보 파일 (ZIP)
            </Label>
            <Input
              ref={zipInputRef}
              type='file'
              accept='.zip'
              className='hidden'
              onChange={e => {
                if (e.target.files?.[0]) handleZipFile(e.target.files?.[0]);
              }}
              id='zip-input'
            />

            {zipName ? (
              <div className='space-y-2'>
                <ZipFileHeader
                  name={zipName}
                  size={zipSize}
                  fileCount={files.length}
                  onClear={resetZip}
                  disabled={isProcessing || isSubmitting}
                />

                {isProcessing ? (
                  <div className='flex items-center justify-center gap-2 py-4 text-muted-foreground'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span className='text-sm'>
                      {isCompressing ? '오디오 MP3 변환 중...' : '압축 해제 중...'}
                    </span>
                  </div>
                ) : (
                  <ReadOnlyFileList files={files} />
                )}

                {!isProcessing && matchState === 'checking-ai' && (
                  <p className='text-xs text-muted-foreground px-1 flex items-center gap-1.5'>
                    <Sparkles className='h-3 w-3 animate-pulse' />
                    AI가 파일명을 확인하는 중...
                  </p>
                )}

                {!isProcessing && matchState === 'ai-match' && (
                  <p className='text-xs text-emerald-600 dark:text-emerald-400 px-1 flex items-center gap-1.5'>
                    <FileCheck className='h-3 w-3' />
                    파일명 일치
                  </p>
                )}

                {!isProcessing && fileValidation && !fileValidation.valid && (
                  <p className='text-xs text-amber-600 dark:text-amber-400 px-1'>
                    누락된 파일: {fileValidation.missing.join(', ')}{' '}
                    {!forceOverride && (
                      <button
                        type='button'
                        onClick={() => setForceOverride(true)}
                        className='underline underline-offset-2 hover:opacity-70 transition-opacity'
                      >
                        그래도 등록하기
                      </button>
                    )}
                  </p>
                )}

                {!isProcessing && matchState === 'ai-error' && (
                  <p className='text-xs text-muted-foreground px-1'>
                    AI 확인을 건너뜁니다. (오프라인 또는 API 미설정)
                  </p>
                )}

                {!isProcessing && matchState === 'no-match' && (
                  <p className='text-xs text-destructive px-1'>
                    ZIP 파일명이 곡명 또는 작곡가명과 일치하지 않습니다.{' '}
                    {!forceOverride && (
                      <button
                        type='button'
                        onClick={() => setForceOverride(true)}
                        className='underline underline-offset-2 hover:opacity-70 transition-opacity'
                      >
                        그래도 등록하기
                      </button>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <DropZone
                onClick={() => zipInputRef.current?.click()}
                onDrop={handleDrop}
              />
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
            <div className={commission.version ? '' : 'col-span-2'}>
              <p className='text-xs text-muted-foreground mb-0.5'>편성</p>
              <p className='font-medium'>{commission.arrangement}</p>
            </div>
            {commission.version && (
              <div>
                <p className='text-xs text-muted-foreground mb-0.5'>버전</p>
                <p className='font-medium'>{commission.version}</p>
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-2 pt-2'>
          <Button
            variant='outline'
            onClick={() => {
              resetZip();
              close();
            }}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className='gap-2'
          >
            {isSubmitting ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <FileCheck className='h-4 w-4' />
            )}
            {isSubmitting ? '악보 등록 중...' : '작업 완료'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
