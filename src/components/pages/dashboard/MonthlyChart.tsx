import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { commissionQueries } from '@/api/commission/queries';
import { useAuth } from '@/hooks/use-auth';
import { demoMonthlyCategoryBreakdown } from '@/data/demo';

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className='bg-foreground text-background px-3 py-1.5 rounded-xl font-display font-bold text-sm shadow-lg'>
      {payload[0].value}건
    </div>
  );
}

function MonthlyChart() {
  const { isGuest } = useAuth();
  const { data: monthlyData = [] } = useQuery(commissionQueries.getMonthlyCommissionCounts());

  const last = monthlyData[monthlyData.length - 1]?.count ?? 0;
  const prev = monthlyData[monthlyData.length - 2]?.count ?? 0;
  const growth = prev > 0 ? Math.round(((last - prev) / prev) * 100) : null;

  return (
    <div className='rounded-[var(--radius)] p-5 h-full' style={{ backgroundColor: 'hsl(345, 38%, 38%)' }}>
      {/* Header */}
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2.5'>
          <h2 className='font-display font-bold text-white text-base'>월별 의뢰 처리량</h2>
          {growth !== null && (
            <span className='text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full'>
              {growth > 0 ? `+${growth}%` : `${growth}%`} 이번 달
            </span>
          )}
        </div>
        <span className='text-xs text-white/60'>{new Date().getFullYear()}년</span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width='100%' height={190}>
        <AreaChart data={isGuest ? demoMonthlyCategoryBreakdown.map(d => ({ ...d, count: d.CLASSIC + d.POP + d['K-POP'] + d.OST + d.ANI + d.ETC }))
          : monthlyData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id='monthlyGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='10%'  stopColor='white' stopOpacity={0.3} />
              <stop offset='90%' stopColor='white' stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray='4 4'
            stroke='rgba(255,255,255,0.18)'
            vertical={false}
          />
          <XAxis
            dataKey='month'
            tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: 'rgba(255,255,255,0.35)',
              strokeWidth: 1,
              strokeDasharray: '4 4',
            }}
          />
          <Area
            type='monotone'
            dataKey='count'
            stroke='white'
            strokeWidth={2.5}
            fill='url(#monthlyGradient)'
            dot={{ fill: 'white', stroke: 'white', r: 3, strokeWidth: 0 }}
            activeDot={{ fill: 'white', stroke: 'rgba(255,255,255,0.4)', r: 5, strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyChart;
