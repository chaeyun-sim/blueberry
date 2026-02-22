import { MusicRecommendation } from '@/mock/recommendations';

export const categoryStyle: Record<MusicRecommendation['category'], string> = {
  CLASSIC: 'bg-primary/10 text-primary border-primary/20',
  OST:     'bg-accent/20 text-accent-foreground border-accent/30',
  ANI:     'bg-[hsl(var(--status-received)/0.15)] text-[hsl(var(--status-received))] border-[hsl(var(--status-received)/0.3)]',
  ETC:     'bg-[hsl(var(--status-complete)/0.15)] text-[hsl(var(--status-complete))] border-[hsl(var(--status-complete)/0.3)]',
};

export const difficultyStyle: Record<MusicRecommendation['difficulty'], string> = {
  '쉬움':   'bg-[hsl(var(--status-complete)/0.12)] text-[hsl(var(--status-complete))]',
  '보통':   'bg-accent/15 text-accent-foreground',
  '어려움': 'bg-destructive/10 text-destructive',
};