import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const mockMonthlyData = [
  { month: '3월',  count: 8  },
  { month: '4월',  count: 13 },
  { month: '5월',  count: 10 },
  { month: '6월',  count: 18 },
  { month: '7월',  count: 22 },
  { month: '8월',  count: 16 },
  { month: '9월',  count: 25 },
  { month: '10월', count: 20 },
  { month: '11월', count: 28 },
  { month: '12월', count: 24 },
  { month: '1월',  count: 19 },
  { month: '2월',  count: 30 },
];

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
  const last = mockMonthlyData[mockMonthlyData.length - 1].count;
  const prev = mockMonthlyData[mockMonthlyData.length - 2].count;
  const growth = Math.round(((last - prev) / prev) * 100);

  return (
    <div className='rounded-[var(--radius)] p-5 h-full' style={{ backgroundColor: 'hsl(345, 38%, 38%)' }}>
      {/* Header */}
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2.5'>
          <h3 className='font-display font-bold text-white text-base'>월별 의뢰 처리량</h3>
          <span className='text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full'>
            {growth > 0 ? `+${growth}%` : `${growth}%`} 이번 달
          </span>
        </div>
        <span className='text-xs text-white/60'>최근 12개월</span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width='100%' height={190}>
        <AreaChart data={mockMonthlyData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
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
