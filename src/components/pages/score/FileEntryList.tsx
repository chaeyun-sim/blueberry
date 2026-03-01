import { fileTypeConfig } from '@/constants/file-types';
import { FileEntry } from '@/types/form';
import { formatFileSize } from '@/utils/format-file-size';
import { X } from 'lucide-react';

interface FileEntryListProps {
  files: FileEntry[];
  isSubmitting: boolean;
  onLabelChange: (idx: number, label: string) => void;
  onRemove: (idx: number) => void;
}

function FileEntryList({
  files,
  isSubmitting,
  onLabelChange,
  onRemove,
}: FileEntryListProps) {
  return (
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
              onChange={e => onLabelChange(idx, e.target.value)}
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
              onClick={() => onRemove(idx)}
              disabled={isSubmitting}
              className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive disabled:pointer-events-none'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default FileEntryList;