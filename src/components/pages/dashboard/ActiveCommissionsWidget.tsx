import dayjs from 'dayjs';
import { ChevronRightIcon, Music2 } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Commission } from '@/features/commission/types';

interface ActiveCommissionsWidgetProps {
  commissions: Commission[];
  isLoading: boolean;
}

function DeadlinePill({ deadline }: { deadline: string }) {
  const days = dayjs(deadline).diff(dayjs(), 'day');
  if (days < 0) return <span className='text-xs font-semibold text-destructive'>초과</span>;
  if (days === 0) return <span className='text-xs font-semibold text-destructive'>오늘</span>;
  if (days <= 3) return <span className='text-xs font-semibold text-destructive'>D-{days}</span>;
  if (days <= 7) return <span className='text-xs font-semibold text-warning'>D-{days}</span>;
  return <span className='text-xs tabular-nums text-muted-foreground'>D-{days}</span>;
}

export function ActiveCommissionsWidget({
  commissions,
  isLoading,
}: ActiveCommissionsWidgetProps) {
  const navigate = useNavigate();
  const working = useMemo(
    () =>
      commissions
        .filter((c) => c.status === 'working')
        .sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf()),
    [commissions],
  );

  return (
    <section className='flex h-full flex-col rounded-3xl border bg-card p-5 shadow-sm md:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <p className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
            지금 작업 중
          </p>
          <span className='rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold tabular-nums'>
            {isLoading ? '—' : working.length}
          </span>
        </div>
        <button
          onClick={() => navigate('/commissions?status=working')}
          className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
        >
          전체 보기
          <ChevronRightIcon className='h-3.5 w-3.5' />
        </button>
      </div>

      <div className='flex-1 space-y-2'>
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className='h-14 animate-pulse rounded-2xl bg-muted/30' />
          ))
        ) : working.length === 0 ? (
          <div className='flex h-full flex-col items-center justify-center py-8 text-muted-foreground'>
            <Music2 className='mb-2 h-7 w-7 opacity-20' />
            <p className='text-sm'>작업 중인 의뢰가 없어요</p>
          </div>
        ) : (
          working.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/commissions/${c.id}`)}
              className='group flex w-full items-center justify-between gap-3 rounded-2xl bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/60 active:bg-muted/60'
            >
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold transition-colors group-hover:text-primary'>
                  {c.songs?.title ?? c.title}
                </p>
                <p className='mt-0.5 truncate text-xs text-muted-foreground'>{c.arrangement}</p>
              </div>
              <div className='shrink-0'>
                <DeadlinePill deadline={c.deadline} />
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
