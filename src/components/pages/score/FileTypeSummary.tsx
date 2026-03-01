import { fileTypeConfig } from '@/constants/file-types';
import { FileEntry } from '@/types/form';

interface FileTypeSummaryProps {
  files: FileEntry[];
}

function FileTypeSummary({ files }: FileTypeSummaryProps) {
  const typeCounts = Object.entries(fileTypeConfig)
    .map(([key, config]) => ({ key, config, count: files.filter(f => f.fileType === key).length }))
    .filter(({ count }) => count > 0);

  return (
    <div className='flex flex-wrap gap-2 pt-2 border-t border-border/50'>
      {typeCounts.map(({ key, config, count }) => (
        <span
          key={key}
          className='text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground flex items-center gap-1'
        >
          <span className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: config.dot }} />
          {config.label} {count}
        </span>
      ))}
    </div>
  );
}

export default FileTypeSummary;