import { FileMusic, FileAudio, FileText, FileIcon } from 'lucide-react';
import { ElementType } from 'react';

export const fileTypeConfig: Record<
  string,
  { icon: ElementType; label: string; color: string; dot: string }
> = {
  score: { icon: FileMusic, label: '스코어', color: 'text-primary', dot: 'hsl(var(--primary))' },
  part: {
    icon: FileMusic,
    label: '파트보',
    color: 'text-[hsl(var(--status-working))]',
    dot: 'hsl(var(--status-working))',
  },
  audio: {
    icon: FileAudio,
    label: '오디오',
    color: 'text-[hsl(var(--warning))]',
    dot: 'hsl(var(--warning))',
  },
  musicxml: {
    icon: FileText,
    label: 'MusicXML',
    color: 'text-[hsl(var(--success))]',
    dot: 'hsl(var(--success))',
  },
  pdf: {
    icon: FileIcon,
    label: 'PDF',
    color: 'text-muted-foreground',
    dot: 'hsl(var(--muted-foreground))',
  },
};

export const ALLOWED_EXTENSIONS = ['musicxml', 'mxl', 'wav', 'aiff', 'mid', 'midi', 'musx', 'xml', 'pdf']
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB