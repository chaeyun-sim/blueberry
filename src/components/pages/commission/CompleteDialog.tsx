import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileCheck, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OverlayProps } from '@/types/overlay';

interface CompleteDialogProps extends OverlayProps {
  onConfirm: (file?: File) => void;
}

export function CompleteDialog({
  isOpen,
  close,
  onConfirm,
}: CompleteDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleConfirm = () => {
    if (file) {
      onConfirm(file)
      close()
    }
  };

  const handleClose = () => {
    setFile(null);
    close();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 font-display'>
            작업을 완료하시겠습니까?
          </DialogTitle>
          <DialogDescription>
            완성된 MusicXML 파일을 첨부하여 작업 여부를 증명해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Drop Zone */}
          <div
            role='button'
            tabIndex={0}
            aria-label='MusicXML 파일 업로드'
            className={cn(
              'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              dragOver
                ? 'border-primary bg-primary/10'
                : file
                  ? 'border-status-complete bg-status-complete/5'
                  : 'border-border hover:border-muted-foreground',
            )}
            onDragOver={e => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
          >
            <input
              ref={inputRef}
              type='file'
              accept='.musicxml,.mxl'
              className='hidden'
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
            {file ? (
              <div className='flex flex-col items-center gap-2'>
                <FileCheck className='h-8 w-8 text-status-complete' />
                <p className='text-sm font-medium truncate max-w-[280px]'>{file.name}</p>
                <p className='text-xs text-muted-foreground'>{(file.size / 1024).toFixed(1)} KB</p>
                <Button
                  variant='ghost'
                  size='sm'
                  className='mt-1 text-xs text-muted-foreground'
                  onClick={e => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X className='h-3 w-3 mr-1' /> 파일 변경
                </Button>
              </div>
            ) : (
              <div className='flex flex-col items-center gap-2'>
                <Upload className='h-8 w-8 text-muted-foreground' />
                <p className='text-sm font-medium'>MusicXML 파일 (.mxl, .musicxml)</p>
                <p className='text-xs text-muted-foreground'>클릭하거나 파일을 드래그해 주세요</p>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className='flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-sm'>
            <AlertTriangle className='h-4 w-4 text-destructive shrink-0 mt-0.5' />
            <p className='text-muted-foreground whitespace-pre-line'>
              {`증빙 파일 없이는 상태를 변경할 수 없습니다.\n파일을 첨부해 주세요.`}
            </p>
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            onClick={handleConfirm}
            className='gap-2'
            disabled={!file}
          >
            <FileCheck className='h-4 w-4' />
            작업 완료
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
