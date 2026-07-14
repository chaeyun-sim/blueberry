import dayjs from 'dayjs';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { commissionQueries } from '@/features/commission/api';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className='rounded-xl bg-foreground px-3 py-1.5 font-display text-sm font-bold text-background shadow-lg'>
      {label} · {payload[0].value}건
    </div>
  );
}

function MonthlyChart() {
  const { data: monthlyData = [] } = useQuery(commissionQueries.getMonthlyCommissionCounts());

  // API는 1~12월 전체를 반환하므로 미래 달(count=0)은 잘라내고 현재 달까지만 표시
  const displayData = monthlyData.slice(0, dayjs().month() + 1);

  const last = displayData[displayData.length - 1]?.count ?? 0;
  const prev = displayData[displayData.length - 2]?.count ?? 0;
  const growth = prev > 0 ? Math.round(((last - prev) / prev) * 100) : null;

  return (
    <div className='flex h-full flex-col rounded-3xl border bg-card p-5 shadow-sm md:p-6'>
      {/* Header */}
      <div className='mb-4 flex items-start justify-between'>
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
            월별 의뢰 처리량
          </p>
          <div className='mt-1 flex items-baseline gap-2'>
            <p className='font-display text-2xl font-bold tabular-nums md:text-3xl'>
              {last}
              <span className='ml-1 text-base font-normal text-muted-foreground'>건</span>
            </p>
            <span className='text-xs text-muted-foreground'>이번 달</span>
            {growth !== null && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                  growth >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }`}
              >
                {growth >= 0 ? '+' : ''}
                {growth}% 전월 대비
              </span>
            )}
          </div>
        </div>
        <span className='text-xs text-muted-foreground'>{dayjs().year()}년</span>
      </div>

      {/* Chart */}
      <div className='min-h-0 flex-1'>
        <ResponsiveContainer width='100%' height={180}>
          <AreaChart data={displayData} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
            <defs>
              <linearGradient id='monthlyGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='10%' stopColor='hsl(var(--primary))' stopOpacity={0.22} />
                <stop offset='95%' stopColor='hsl(var(--primary))' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='4 4' stroke='hsl(var(--border))' vertical={false} />
            <XAxis
              dataKey='month'
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: 'hsl(var(--muted-foreground) / 0.35)',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />
            <Area
              type='monotone'
              dataKey='count'
              stroke='hsl(var(--primary))'
              strokeWidth={2.5}
              fill='url(#monthlyGradient)'
              dot={{ fill: 'hsl(var(--primary))', r: 3, strokeWidth: 0 }}
              activeDot={{
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--primary) / 0.25)',
                r: 5,
                strokeWidth: 4,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MonthlyChart;
