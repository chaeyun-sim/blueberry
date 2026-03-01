import { formatFileSize } from '@/utils/format-file-size';
import { FileArchive, X } from 'lucide-react';

function ZipFileHeader({
  name,
  size,
  fileCount,
  onClear,
  disabled,
}: {
  name: string;
  size: number;
  fileCount: number;
  onClear: () => void;
  disabled: boolean;
}) {
  return (
    <div className='flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/15'>
      <div className='flex items-center gap-3'>
        <FileArchive className='h-5 w-5 text-primary shrink-0' />
        <div>
          <p className='text-sm font-medium truncate max-w-[280px]'>{name}</p>
          <p className='text-xs text-muted-foreground'>
            {formatFileSize(size)}{fileCount > 0 && ` · ${fileCount}개 파일`}
          </p>
        </div>
      </div>
      <button
        aria-label='파일 제거'
        onClick={onClear}
        disabled={disabled}
        className='p-1 rounded hover:bg-foreground/5 transition-colors disabled:pointer-events-none'
      >
        <X className='h-4 w-4 text-muted-foreground' />
      </button>
    </div>
  );
}

export default ZipFileHeader;