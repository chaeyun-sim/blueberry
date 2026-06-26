import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell,Pie, PieChart } from 'recharts';
import { Commission } from '@/features/commission/types';

interface Props {
  commissions: Commission[];
  totalScores: number;
}

const STATUS_SEGMENTS = [
  { key: 'received', label: '대기',   color: 'hsl(0 65% 54%)' },
  { key: 'working',  label: '작업중', color: 'hsl(252 55% 40%)' },
  { key: 'complete', label: '완료',   color: 'hsl(150 45% 38%)' },
] as const;

export function StatusDonutWidget({ commissions, totalScores }: Props) {
  const navigate = useNavigate();
  const { counts, total, chartData } = useMemo(() => {
    const thisMonth = commissions.filter((c) =>
      dayjs(c.deadline).isSame(dayjs(), 'month'),
    );
    const counts = STATUS_SEGMENTS.map(({ key, label, color }) => ({
      label,
      color,
      key,
      value: thisMonth.filter((c) => c.status === key).length,
    }));
    const total = counts.reduce((a, b) => a + b.value, 0);
    const chartData = total > 0 ? counts.filter((d) => d.value > 0) : [{ value: 1, color: 'hsl(var(--muted))', label: '', key: '' }];
    return { counts, total, chartData };
  }, [commissions]);

  return (
    <div className='bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 border shadow-sm flex flex-col justify-between'>
      {/* ── Mobile (md 미만) ────────────────────────── */}
      <div className='md:hidden flex flex-col gap-3'>
        <p className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
          이번 달 현황
        </p>
        <p className='text-2xl font-display font-bold tabular-nums'>
          {total}
          <span className='text-base font-normal text-muted-foreground ml-1'>건</span>
        </p>
        <div className='space-y-2'>
          {counts.map(({ key, label, color, value }) => (
            <button
              key={key}
              onClick={() => navigate(`/commissions?status=${key}`)}
              className='w-full flex items-center justify-between active:opacity-70 transition-opacity'
            >
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full shrink-0' style={{ backgroundColor: color }} />
                <span className='text-xs text-muted-foreground'>{label}</span>
              </div>
              <span className='text-sm font-bold tabular-nums'>{value}</span>
            </button>
          ))}
        </div>
        <div className='pt-2 border-t flex items-center justify-between'>
          <p className='text-xs text-muted-foreground'>보유 악보</p>
          <p className='text-sm font-bold tabular-nums'>{totalScores}곡</p>
        </div>
      </div>

      {/* ── Desktop full (md 이상) ─────────────────── */}
      <div className='hidden md:block'>
        <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4'>
          이번 달 현황
        </p>

        <div className='flex items-center gap-4'>
          {/* Donut */}
          <div className='relative shrink-0'>
            <PieChart width={100} height={100}>
              <Pie
                data={chartData}
                cx={44}
                cy={44}
                innerRadius={30}
                outerRadius={46}
                dataKey='value'
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <p className='text-xl font-display font-bold tabular-nums'>{total}</p>
              <p className='text-[9px] text-muted-foreground leading-none'>건</p>
            </div>
          </div>

          {/* Legend */}
          <div className='flex-1 space-y-2.5'>
            {counts.map(({ key, label, color, value }) => (
              <button
                key={key}
                onClick={() => navigate(`/commissions?status=${key}`)}
                className='w-full flex items-center justify-between hover:opacity-70 transition-opacity'
              >
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full shrink-0' style={{ backgroundColor: color }} />
                  <span className='text-xs text-muted-foreground'>{label}</span>
                </div>
                <span className='text-sm font-bold tabular-nums'>{value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom: 보유 악보 */}
        <div className='mt-5 pt-4 border-t flex items-center justify-between'>
          <p className='text-xs text-muted-foreground'>보유 악보</p>
          <p className='text-sm font-bold tabular-nums'>{totalScores}곡</p>
        </div>
      </div>
    </div>
  );
}
