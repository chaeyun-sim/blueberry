import { fileTypeConfig } from '@/constants/file-types';
import { FileEntry } from '@/types/form';

interface ReadOnlyFileListProps {
  files: FileEntry[];
}

function ReadOnlyFileList({ files }: ReadOnlyFileListProps) {
  return (
    <div className='space-y-1 max-h-36 overflow-y-auto'>
      {files.map((entry, idx) => {
        const config = fileTypeConfig[entry.fileType] ?? fileTypeConfig.score;
        const Icon = config.icon;
        return (
          <div key={idx} className='flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 text-sm'>
            <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
            <span className='flex-1 truncate'>{entry.label}</span>
            <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground'>
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default ReadOnlyFileList;