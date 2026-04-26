import { Commission } from '@/types/commission';
import { useNavigate } from 'react-router-dom';
import { Music2, ArrowRight } from 'lucide-react';
import dayjs from 'dayjs';

interface Props {
  commissions: Commission[];
  isLoading: boolean;
}

function DeadlinePill({ deadline }: { deadline: string }) {
  const days = dayjs(deadline).diff(dayjs(), 'day');
  if (days < 0) return <span className='text-xs font-semibold text-destructive'>초과</span>;
  if (days === 0) return <span className='text-xs font-semibold text-destructive'>오늘</span>;
  if (days <= 3) return <span className='text-xs font-semibold text-destructive'>D-{days}</span>;
  if (days <= 7) return <span className='text-xs font-semibold text-[hsl(var(--warning))]'>D-{days}</span>;
  return <span className='text-xs text-muted-foreground'>D-{days}</span>;
}

export function ActiveCommissionsWidget({ commissions, isLoading }: Props) {
  const navigate = useNavigate();
  const working = commissions
    .filter((c) => c.status === 'working')
    .sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf());

  return (
    <div className='bg-card rounded-3xl p-6 h-full border shadow-sm flex flex-col'>
      <div className='flex items-start justify-between mb-5'>
        <div>
          <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
            지금 작업 중
          </p>
          <p className='text-4xl font-display font-bold mt-1 tabular-nums'>
            {isLoading ? '—' : working.length}
            <span className='text-lg text-muted-foreground font-normal ml-1'>건</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/commissions?status=working')}
          className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1'
        >
          전체 보기
          <ArrowRight className='h-3 w-3' />
        </button>
      </div>

      <div className='flex-1 space-y-2'>
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className='h-[60px] rounded-2xl bg-muted/30 animate-pulse' />
          ))
        ) : working.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full py-10 text-muted-foreground'>
            <Music2 className='h-8 w-8 mb-2 opacity-20' />
            <p className='text-sm'>작업 중인 의뢰가 없어요</p>
          </div>
        ) : (
          working.slice(0, 5).map((c) => (
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
              <div className='shrink-0'>
                <DeadlinePill deadline={c.deadline} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
