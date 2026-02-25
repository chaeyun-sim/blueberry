import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Layers } from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import TopSongBar from './TopSongBar';
import { useAppQuery as useQuery } from '@/hooks/useAppQuery';
import { statsQueries } from '@/api/stats/queries';
import { MONEY_RATIO } from '@/constants/money-ratio';

const categoryColors: Record<string, string> = {
  CLASSIC: 'hsl(var(--status-complete))',
  POP: 'hsl(var(--primary))',
  'K-POP': 'hsl(var(--accent))',
  OST: 'hsl(var(--status-received))',
  ANI: 'hsl(220 70% 55%)',
  ETC: 'hsl(var(--muted-foreground))',
}

const topProductColors = [
  'hsl(var(--primary))',
  'hsl(var(--status-complete))',
  'hsl(var(--accent))',
  'hsl(var(--status-received))',
  'hsl(220 70% 55%)',
];

function Stats() {
  const { data: categoryDistribution } = useQuery(statsQueries.getCategoryDistribution());
  const { data: topSongs = [] } = useQuery(statsQueries.getTopSongs());
  const { data: topArrangements = [] } = useQuery(statsQueries.getTopArrangements());
  const { data: yearRange } = useQuery(statsQueries.getSalesYearRange());

  const [monthlySalesYear, setMonthlySalesYear] = useState<number | null>(null);
  const selectedYear = monthlySalesYear ?? yearRange?.max ?? new Date().getFullYear();
  const yearOptions = yearRange
    ? Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) => yearRange.max - i)
    : [selectedYear];
  
  const { data: topSongMonthlySales } = useQuery(statsQueries.getTopSongMonthlySales(selectedYear));

  const songConfig = topSongMonthlySales?.config ?? {};
  const songKeys = Object.keys(songConfig);
  const topProductConfig: ChartConfig = Object.fromEntries(
    songKeys.map((key, i) => [key, { label: songConfig[key], color: topProductColors[i % topProductColors.length] }])
  );

  const songKeysData = [...topSongs].sort((a, b) => a.rank - b.rank);
  const maxSales = Math.max(...songKeysData.map(s => s.sales), 1);
  const salesStep = Math.ceil(maxSales / 5);
  const salesTicks = Array.from({ length: 6 }, (_, i) => i * salesStep);
  return (
    <>
      <div className='grid lg:grid-cols-3 gap-6 min-w-0'>
        <Card className='min-w-0'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base font-display'>카테고리별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className='mx-auto aspect-square max-h-[250px]'
            >
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey='countShare'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                  stroke='hsl(var(--background))'
                >
                  {categoryDistribution?.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={categoryColors[entry.name] ?? `hsl(${i * 55} 60% 55%)`}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className='rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md space-y-0.5'>
                        <p className='font-semibold'>{d.name}</p>
                        <p className='text-muted-foreground'>{d.count.toLocaleString()}건</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ChartContainer>
            <div className='flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2'>
              {categoryDistribution?.map(c => (
                <div key={c.name} className='flex items-center gap-1.5 text-xs'>
                  <span
                    className='w-2.5 h-2.5 rounded-full shrink-0'
                    style={{ backgroundColor: categoryColors[c.name] }}
                  />
                  <span className='font-medium'>{c.name}</span>
                  <span className='text-muted-foreground'>{c.countShare}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='border-border/50 lg:col-span-2 min-w-0'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base font-display flex items-center gap-2'>
              가장 많이 팔린 곡 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ sales: { label: '판매수', color: 'hsl(var(--primary))' } }}
              className='w-full h-[280px]'
            >
              <BarChart
                data={songKeysData.slice(0, 5)}
                layout='vertical'
                barSize={18}
                barCategoryGap={28}
                margin={{ left: 8, right: 16, top: 20, bottom: 4 }}
              >
                <YAxis
                  dataKey='title'
                  type='category'
                  hide
                />
                <XAxis
                  type='number'
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  ticks={salesTicks}
                  domain={[0, salesStep * 5]}
                />
                <CartesianGrid
                  vertical={true}
                  horizontal={false}
                  strokeDasharray='3 3'
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(_, __, item) => (
                        <div className='flex flex-col gap-0.5'>
                          <span className='text-muted-foreground text-xs'>
                            {item.payload.category}
                          </span>
                          <span>{formatCurrency(item.payload.revenue)}</span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey='sales'
                  shape={(args: { index: number; x: number; y: number; width: number; height: number }) => (
                    <TopSongBar {...args} song={songKeysData[args.index]} />
                  )}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className='border-border/50'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base font-display flex items-center gap-2'>
            <Layers className='h-4 w-4' />
            가장 많이 팔린 편성 TOP 5
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid lg:grid-cols-2 gap-2 lg:gap-8 items-center'>
            <ChartContainer
              config={{ sales: { label: '판매수', color: 'hsl(var(--primary))' } }}
              className='w-full h-[200px] lg:h-[260px]'
            >
              <RadarChart data={topArrangements.map(arr => ({ subject: arr.arrangement, sales: arr.sales, revenue: arr.revenue * MONEY_RATIO }))} cx='50%' cy='50%'>
                <PolarGrid
                  strokeDasharray='3 3'
                  stroke='hsl(var(--foreground) / 0.15)'
                />
                <PolarAngleAxis
                  dataKey='subject'
                  tickLine={false}
                  tick={({ x, y, payload, textAnchor }: { x: number; y: number; payload: { value: string }; textAnchor: string }) => {
                    const text = payload.value;
                    const parenIdx = text.indexOf('(');
                    const lines = text.length > 16 && parenIdx > 0
                      ? [text.slice(0, parenIdx).trim(), text.slice(parenIdx).trim()]
                      : [text];
                    return (
                      <text
                        x={x}
                        y={y - (lines.length > 1 ? 8 : 0)}
                        textAnchor={textAnchor}
                        fill='hsl(var(--foreground) / 0.6)'
                        fontSize={11}
                        fontWeight={600}
                      >
                        {lines.map((line, i) => (
                          <tspan key={i} x={x} dy={i === 0 ? 0 : '1.4em'}>{line}</tspan>
                        ))}
                      </text>
                    );
                  }}
                />
                <Radar
                  dataKey='sales'
                  fill='hsl(var(--primary))'
                  fillOpacity={0.25}
                  stroke='hsl(var(--primary))'
                  strokeWidth={2}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(_, __, item) => (
                        <div className='flex flex-col gap-0.5'>
                          <span className='font-medium'>{item.payload.subject}</span>
                          <span className='text-muted-foreground text-xs'>
                            {formatCurrency(item.payload.revenue)}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
              </RadarChart>
            </ChartContainer>

            <div className='divide-y divide-border/50'>
              {[...(topArrangements ?? [])].sort((a, b) => b.revenue - a.revenue).map(arr => (
                <div
                  key={arr.rank}
                  className='flex items-center gap-3 py-3'
                >
                  <span className='text-sm font-display font-bold text-muted-foreground w-4 shrink-0'>
                    {arr.rank}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {arr.arrangement}
                      <span className='text-xs text-muted-foreground font-normal ml-2'>
                        {arr.sales}건 · {formatCurrency(arr.revenue * MONEY_RATIO)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-border/50'>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base font-display'>인기곡 월별 판매 추이</CardTitle>
            <Select
              value={String(selectedYear)}
              onValueChange={v => setMonthlySalesYear(Number(v))}
            >
              <SelectTrigger className='w-24 h-7 text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}년</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={topProductConfig}
            className='w-full h-[260px]'
          >
            <LineChart
              data={topSongMonthlySales?.data ?? []}
              margin={{ left: 8, right: 8, top: 4, bottom: 4 }}
            >
              <CartesianGrid
                horizontal={true}
                vertical={false}
                strokeDasharray='3 3'
              />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis hide />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className='rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md space-y-1'>
                      <p className='font-semibold mb-1'>{d.month}</p>
                      {songKeys.map(key => (
                        <div
                          key={key}
                          className='flex items-center justify-between gap-4'
                        >
                          <span className='flex items-center gap-1.5'>
                            <span
                              className='w-2 h-2 rounded-full'
                              style={{ backgroundColor: topProductConfig[key].color }}
                            />
                            {topProductConfig[key].label}
                          </span>
                          <span className='tabular-nums text-muted-foreground'>{d[key]}건</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {songKeys.map(key => (
                <Line
                  key={key}
                  dataKey={key}
                  type='monotone'
                  stroke={topProductConfig[key].color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ChartContainer>
          <div className='flex flex-wrap justify-center gap-x-5 gap-y-2 mt-3'>
            {songKeys.map(key => (
              <span
                key={key}
                className='flex items-center gap-1.5 text-xs text-muted-foreground'
              >
                <span
                  className='w-2 h-2 rounded-full'
                  style={{ backgroundColor: topProductConfig[key].color }}
                />
                {topProductConfig[key].label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default Stats;
