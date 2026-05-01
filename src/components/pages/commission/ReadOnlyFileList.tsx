import { fileTypeConfig } from '@/constants/file-types';
import { FileEntry } from '@/types/form';

interface ReadOnlyFileListProps {
  files: FileEntry[];
}

function getDisplayLabel(fileType: string, label: string): string {
  if (fileType === 'audio') return '오디오';
  if (fileType === 'musicxml') return 'Music XML';
  if (['score', 'part', 'finale'].includes(fileType)) {
    if (!label.includes(' - ')) return 'Score';
    return `Part - ${label.split(' - ').pop()!}`;
  }
  return label;
}

function getSortKey(fileType: string, label: string): [number, string] {
  if (fileType === 'audio') return [0, ''];
  if (fileType === 'musicxml') return [1, ''];
  if (['score', 'part', 'finale'].includes(fileType) && !label.includes(' - ')) return [2, ''];
  const instrument = label.includes(' - ') ? label.split(' - ').pop()! : label;
  return [3, instrument.toLowerCase()];
}

function ReadOnlyFileList({ files }: ReadOnlyFileListProps) {
  const sorted = [...files].sort((a, b) => {
    const [aPriority, aName] = getSortKey(a.fileType, a.label);
    const [bPriority, bName] = getSortKey(b.fileType, b.label);
    if (aPriority !== bPriority) return aPriority - bPriority;
    return aName.localeCompare(bName);
  });

  return (
    <div className='space-y-1 max-h-36 overflow-y-auto overflow-x-hidden'>
      {sorted.map((entry, idx) => {
        const config = fileTypeConfig[entry.fileType] ?? fileTypeConfig.score;
        const Icon = config.icon;
        const displayLabel = getDisplayLabel(entry.fileType, entry.label);
        return (
          <div key={idx} className='flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 text-sm min-w-0'>
            <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
            <span className='flex-1 truncate'>{displayLabel}</span>
            <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0'>
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default ReadOnlyFileList;