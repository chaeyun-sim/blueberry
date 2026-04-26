import { Commission } from '@/types/commission';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { CalendarClock } from 'lucide-react';

interface Props {
  commissions: Commission[];
}

function urgencyLabel(days: number) {
  if (days < 0) return { label: '초과', text: 'text-destructive font-bold' };
  if (days === 0) return { label: '오늘', text: 'text-destructive font-bold' };
  if (days <= 3) return { label: `D-${days}`, text: 'text-destructive font-semibold' };
  if (days <= 7) return { label: `D-${days}`, text: 'text-[hsl(var(--warning))] font-semibold' };
  return { label: `D-${days}`, text: 'text-muted-foreground' };
}

export function DeadlineWidget({ commissions }: Props) {
  const navigate = useNavigate();

  const upcoming = commissions
    .filter((c) => c.status !== 'complete' && c.status !== 'cancelled' && c.deadline)
    .map((c) => ({ ...c, daysLeft: dayjs(c.deadline).diff(dayjs(), 'day') }))
    .filter((c) => c.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  return (
    <div className='bg-card rounded-3xl p-6 h-full border shadow-sm flex flex-col'>
      <div className='mb-5'>
        <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
          마감 임박
        </p>
        <p className='text-4xl font-display font-bold mt-1 tabular-nums'>
          {upcoming.length}
          <span className='text-lg text-muted-foreground font-normal ml-1'>건</span>
        </p>
      </div>

      <div className='flex-1 space-y-3'>
        {upcoming.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full py-8 text-muted-foreground'>
            <CalendarClock className='h-7 w-7 mb-2 opacity-20' />
            <p className='text-sm text-center'>여유 있어요</p>
            <p className='text-[11px] text-muted-foreground/60 mt-0.5'>7일 내 마감 없음</p>
          </div>
        ) : (
          upcoming.map((c) => {
            const { label, text } = urgencyLabel(c.daysLeft);
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/commissions/${c.id}`)}
                className='w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-colors text-left group'
              >
                <div className='min-w-0 flex-1'>
                  <p className='font-semibold text-sm truncate group-hover:text-primary transition-colors'>
                    {c.songs?.title ?? c.title}
                  </p>
                  <p className='text-[11px] text-muted-foreground mt-0.5 truncate'>{c.arrangement}</p>
                </div>
                <span className={`text-xs shrink-0 ${text}`}>{label}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
