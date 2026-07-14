import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart } from 'recharts';
import { Commission } from '@/features/commission/types';

interface Props {
  commissions: Commission[];
  totalScores: number;
  totalCompleted: number;
  lastMonthRevenue: number | null;
  revenueDelta: number | null;
}

const STATUS_SEGMENTS = [
  { key: 'received', label: '대기', color: 'hsl(0 65% 54%)' },
  { key: 'working', label: '작업중', color: 'hsl(252 55% 40%)' },
  { key: 'complete', label: '완료', color: 'hsl(150 45% 38%)' },
] as const;

export function StatusDonutWidget({
  commissions,
  totalScores,
  totalCompleted,
  lastMonthRevenue,
  revenueDelta,
}: Props) {
  const navigate = useNavigate();
  const { counts, total, chartData } = useMemo(() => {
    const thisMonth = commissions.filter((c) => dayjs(c.deadline).isSame(dayjs(), 'month'));
    const counts = STATUS_SEGMENTS.map(({ key, label, color }) => ({
      label,
      color,
      key,
      value: thisMonth.filter((c) => c.status === key).length,
    }));
    const total = counts.reduce((a, b) => a + b.value, 0);
    const chartData =
      total > 0
        ? counts.filter((d) => d.value > 0)
        : [{ value: 1, color: 'hsl(var(--muted))', label: '', key: '' }];
    return { counts, total, chartData };
  }, [commissions]);

  return (
    <section className='flex h-full flex-col rounded-3xl border bg-card p-5 shadow-sm md:p-6'>
      <p className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
        이번 달 현황
      </p>

      <div className='mt-4 flex items-center gap-5'>
        {/* Donut */}
        <div className='relative shrink-0'>
          <PieChart width={96} height={96}>
            <Pie
              data={chartData}
              cx={43}
              cy={43}
              innerRadius={30}
              outerRadius={44}
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
            <p className='font-display text-xl font-bold tabular-nums'>{total}</p>
            <p className='text-[9px] leading-none text-muted-foreground'>건</p>
          </div>
        </div>

        {/* Legend */}
        <div className='flex-1 space-y-2.5'>
          {counts.map(({ key, label, color, value }) => (
            <button
              key={key}
              onClick={() => navigate(`/commissions?status=${key}`)}
              className='flex w-full items-center justify-between transition-opacity hover:opacity-70 active:opacity-60'
            >
              <div className='flex items-center gap-2'>
                <div className='h-2 w-2 shrink-0 rounded-full' style={{ backgroundColor: color }} />
                <span className='text-xs text-muted-foreground'>{label}</span>
              </div>
              <span className='text-sm font-bold tabular-nums'>{value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 요약 스탯 */}
      <div className='mt-auto space-y-2 border-t pt-4'>
        <div className='mt-1 flex items-center justify-between'>
          <p className='text-xs text-muted-foreground'>보유 악보</p>
          <p className='text-sm font-bold tabular-nums'>{totalScores}곡</p>
        </div>
        <button
          onClick={() => navigate('/commissions?status=complete')}
          className='flex w-full items-center justify-between transition-opacity hover:opacity-70'
        >
          <p className='text-xs text-muted-foreground'>누적 완료</p>
          <p className='text-sm font-bold tabular-nums'>{totalCompleted}건</p>
        </button>
        <button
          onClick={() => navigate('/stats')}
          className='flex w-full items-center justify-between transition-opacity hover:opacity-70'
        >
          <p className='text-xs text-muted-foreground'>지난달 매출</p>
          <p className='text-sm font-bold tabular-nums'>
            {lastMonthRevenue === null ? (
              <span className='inline-block h-4 w-16 animate-pulse rounded-md bg-muted' />
            ) : lastMonthRevenue === 0 ? (
              // 판매 보고서 미업로드 상태 — ₩0 -100%로 오해되지 않게 처리
              <span className='text-xs font-medium text-muted-foreground'>보고서 없음</span>
            ) : (
              <>
                ₩{lastMonthRevenue.toLocaleString()}
                {revenueDelta !== null && (
                  <span
                    className={`ml-1.5 text-[11px] font-semibold ${
                      revenueDelta >= 0 ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {revenueDelta >= 0 ? '+' : ''}
                    {revenueDelta}%
                  </span>
                )}
              </>
            )}
          </p>
        </button>
      </div>
    </section>
  );
}
