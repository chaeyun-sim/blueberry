import { Commission } from '@/types/commission';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Inbox } from 'lucide-react';
import dayjs from 'dayjs';

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

export function DiscoverWidget({ commissions, isLoading }: Props) {
  const navigate = useNavigate();

  const received = commissions
    .filter((c) => c.status === 'received')
    .sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf());

  return (
    <div className='bg-card rounded-3xl p-6 border shadow-sm'>
      <div className='flex items-center justify-between mb-5'>
        <div>
          <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
            대기 중
          </p>
          <p className='text-4xl font-display font-bold mt-1 tabular-nums'>
            {isLoading ? '—' : received.length}
            <span className='text-lg text-muted-foreground font-normal ml-1'>건</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/commissions?status=received')}
          className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors'
        >
          전체 보기
          <ArrowRight className='h-3 w-3' />
        </button>
      </div>

      {isLoading ? (
        <div className='flex gap-3 overflow-hidden'>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className='h-24 w-44 shrink-0 rounded-2xl bg-muted/30 animate-pulse' />
          ))}
        </div>
      ) : received.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-8 text-muted-foreground'>
          <Inbox className='h-7 w-7 mb-2 opacity-20' />
          <p className='text-sm'>대기 중인 의뢰가 없어요</p>
        </div>
      ) : (
        <div className='flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide'>
          {received.map((c, i) => {
            const daysLeft = dayjs(c.deadline).diff(dayjs(), 'day');
            const urgent = daysLeft <= 3;
            const style = getStyle(c.songs?.category, i);
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/commissions/${c.id}`)}
                className={`shrink-0 flex flex-col justify-between p-4 rounded-2xl w-44 cursor-pointer hover:opacity-80 transition-opacity text-left ${style.bg}`}
              >
                <div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.text}`}>
                    {style.label}
                  </span>
                  <p className='text-sm font-semibold mt-1.5 line-clamp-2 leading-snug'>
                    {c.songs?.title ?? c.title}
                  </p>
                </div>
                <p className={`text-[10px] font-semibold mt-3 ${urgent ? 'text-destructive' : style.text}`}>
                  D-{daysLeft} 마감
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
