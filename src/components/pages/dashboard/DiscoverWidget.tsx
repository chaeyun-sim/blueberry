import dayjs from 'dayjs';
import { ChevronRightIcon, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Commission } from '@/features/commission/types';

interface Props {
  commissions: Commission[];
  isLoading: boolean;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  CLASSIC: { bg: 'bg-[hsl(150_45%_92%)] dark:bg-[hsl(150_30%_18%)]', text: 'text-[hsl(150_45%_35%)] dark:text-[hsl(150_45%_60%)]', label: '클래식' },
  POP: { bg: 'bg-[hsl(var(--primary)/0.08)]', text: 'text-primary', label: '팝' },
  'K-POP': { bg: 'bg-[hsl(270_50%_93%)] dark:bg-[hsl(270_30%_18%)]', text: 'text-[hsl(270_50%_45%)] dark:text-[hsl(270_50%_70%)]', label: 'K-POP' },
  OST: { bg: 'bg-[hsl(30_80%_93%)] dark:bg-[hsl(30_40%_18%)]', text: 'text-[hsl(30_70%_40%)] dark:text-[hsl(30_70%_65%)]', label: 'OST' },
  ANI: { bg: 'bg-[hsl(220_70%_93%)] dark:bg-[hsl(220_40%_18%)]', text: 'text-[hsl(220_70%_45%)] dark:text-[hsl(220_70%_65%)]', label: '애니' },
  ETC: { bg: 'bg-[hsl(340_60%_93%)] dark:bg-[hsl(340_30%_18%)]', text: 'text-[hsl(340_55%_45%)] dark:text-[hsl(340_55%_70%)]', label: '기타' },
};

const FALLBACK_STYLES = [
  { bg: 'bg-[hsl(200_70%_93%)] dark:bg-[hsl(200_40%_18%)]', text: 'text-[hsl(200_70%_40%)] dark:text-[hsl(200_70%_65%)]' },
  { bg: 'bg-[hsl(45_90%_92%)] dark:bg-[hsl(45_40%_18%)]', text: 'text-[hsl(45_80%_38%)] dark:text-[hsl(45_80%_65%)]' },
  { bg: 'bg-[hsl(300_40%_93%)] dark:bg-[hsl(300_25%_18%)]', text: 'text-[hsl(300_40%_42%)] dark:text-[hsl(300_40%_68%)]' },
];

function getStyle(category: string | null | undefined, idx: number) {
  if (category && CATEGORY_STYLES[category]) return CATEGORY_STYLES[category];
  return { ...FALLBACK_STYLES[idx % FALLBACK_STYLES.length], label: '기타' };
}

function DiscoverContent({ received, isLoading, navigate }: {
  received: Commission[];
  isLoading: boolean;
  navigate: (path: string) => void;
}) {
  if (isLoading) {
    return (
      <div className='flex gap-3 overflow-hidden'>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className='h-24 w-44 shrink-0 animate-pulse rounded-2xl bg-muted/30' />
        ))}
      </div>
    );
  }

  if (received.length === 0) {
    return (
      <div className='flex h-full flex-col items-center justify-center py-8 text-muted-foreground'>
        <Inbox className='mb-2 h-7 w-7 opacity-20' />
        <p className='text-sm'>대기 중인 의뢰가 없어요</p>
      </div>
    );
  }

  return (
    <div className='-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-hide'>
      {received.map((c, i) => {
        const daysLeft = dayjs(c.deadline).diff(dayjs(), 'day');
        const urgent = daysLeft <= 3;
        const style = getStyle(c.songs?.category, i);
        return (
          <button
            key={c.id}
            onClick={() => navigate(`/commissions/${c.id}`)}
            className={`flex w-44 shrink-0 cursor-pointer flex-col justify-between rounded-2xl p-4 text-left transition-opacity hover:opacity-80 active:scale-[0.99] ${style.bg}`}
          >
            <div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.text}`}>
                {style.label}
              </span>
              <p className='mt-1.5 line-clamp-2 text-sm font-semibold leading-snug'>
                {c.songs?.title ?? c.title}
              </p>
            </div>
            <p className={`mt-3 text-[10px] font-semibold ${urgent ? 'text-destructive' : style.text}`}>
              {daysLeft === 0 ? '오늘 마감' : `D-${daysLeft} 마감`}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function DiscoverWidget({ commissions, isLoading }: Props) {
  const navigate = useNavigate();

  const received = commissions
    .filter((c) => c.status === 'received' && dayjs(c.deadline).diff(dayjs(), 'day') >= 0)
    .sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf());

  return (
    <section className='flex h-full flex-col rounded-3xl border bg-card p-5 shadow-sm md:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <p className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
            대기 큐
          </p>
          <span className='rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold tabular-nums'>
            {isLoading ? '—' : received.length}
          </span>
        </div>
        <button
          onClick={() => navigate('/commissions?status=received')}
          className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
        >
          전체 보기
          <ChevronRightIcon className='h-3.5 w-3.5' />
        </button>
      </div>

      <div className='flex-1'>
        <DiscoverContent received={received} isLoading={isLoading} navigate={navigate} />
      </div>
    </section>
  );
}
