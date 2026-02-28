import { FileMusic, FileAudio, FileText, File as FileIcon } from 'lucide-react';
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
  finale: {
    icon: FileText,
    label: 'Finale',
    color: 'text-[hsl(var(--accent))]',
    dot: 'hsl(var(--accent))',
  },
  pdf: {
    icon: FileIcon,
    label: 'PDF',
    color: 'text-muted-foreground',
    dot: 'hsl(var(--muted-foreground))',
  },
};

export const MUSICXML_EXTENSIONS = ['xml', 'musicxml', 'mxl'];
export const FINALE_EXTENSIONS = ['musx'];
export const AUDIO_EXTENSIONS = ['wav', 'aif', 'aiff', 'aifc', 'mp3', 'mid', 'midi'];

export const ALLOWED_EXTENSIONS = [...MUSICXML_EXTENSIONS, ...FINALE_EXTENSIONS, ...AUDIO_EXTENSIONS, 'pdf']
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB