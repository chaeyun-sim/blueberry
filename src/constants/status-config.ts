import { ChartConfig } from '@/components/ui/chart';

export type CommissionStatus = 'received' | 'working' | 'complete' | 'cancelled';

export const statusConfig: Record<CommissionStatus, { label: string; badgeClass: string }> = {
  received: { label: '대기', badgeClass: 'badge-received' },
  working: { label: '작업중', badgeClass: 'badge-working' },
  complete: { label: '완료', badgeClass: 'badge-complete' },
  cancelled: { label: '취소', badgeClass: 'badge-cancelled' },
};

export const categoryColors: Record<string, string> = {
  CLASSIC: 'hsl(var(--status-complete))',
  POP: 'hsl(var(--primary))',
  'K-POP': 'hsl(var(--accent))',
  OST: 'hsl(var(--status-received))',
  ANI: 'hsl(220 70% 55%)',
  ETC: 'hsl(var(--muted-foreground))',
};

export const topProductColors = [
  'hsl(var(--primary))',
  'hsl(var(--status-complete))',
  'hsl(var(--accent))',
  'hsl(var(--status-received))',
  'hsl(220 70% 55%)',
];

export const categoryChartConfig: ChartConfig = {
  CLASSIC: { label: 'CLASSIC', color: 'hsl(var(--status-complete))' },
  POP: { label: 'POP', color: 'hsl(var(--primary))' },
  'K-POP': { label: 'K-POP', color: 'hsl(var(--accent))' },
  OST: { label: 'OST', color: 'hsl(var(--status-received))' },
  ANI: { label: 'ANI', color: 'hsl(220 70% 55%)' },
  ETC: { label: 'ETC', color: 'hsl(var(--muted-foreground))' },
};
