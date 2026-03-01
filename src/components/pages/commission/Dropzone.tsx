import { cn } from '@/lib/utils';
import { FileArchive } from 'lucide-react';
import { DragEventHandler } from 'react';

interface DropZoneProps {
  onClick: () => void;
  onDrop: DragEventHandler<HTMLButtonElement>;
  className?: string;
}

function DropZone({ onClick, onDrop, className }: DropZoneProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
      className={cn('w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer', className)}
    >
      <FileArchive className='h-8 w-8 text-muted-foreground' />
      <div className='text-center'>
        <p className='text-sm font-medium'>ZIP 파일을 드래그하거나 클릭하여 업로드</p>
        <p className='text-xs text-muted-foreground mt-1'>스코어, 파트보, MusicXML, AIFF/WAV 파일이 담긴 ZIP</p>
      </div>
    </button>
  );
}

export default DropZone