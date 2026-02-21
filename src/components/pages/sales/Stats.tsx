import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import {
  mockTopSongs,
  mockTopArrangements,
  mockTopProductMonthlySales,
  mockTopProductConfig,
} from '@/mock/sales';
import { formatCurrency } from '@/utils/format-currency';
import TopSongBar from './TopSongBar';

const categoryData = [
  { name: 'CLASSIC', value: 45, fill: 'hsl(var(--primary))' },
  { name: 'OST', value: 25, fill: 'hsl(var(--accent))' },
  { name: 'ANI', value: 18, fill: 'hsl(var(--status-received))' },
  { name: 'ETC', value: 12, fill: 'hsl(var(--status-complete))' },
];

const topProductColors = [
  'hsl(var(--primary))',
  'hsl(var(--status-complete))',
  'hsl(var(--accent))',
  'hsl(var(--status-received))',
];

const songKeys = Object.keys(mockTopProductConfig);
const topProductConfig: ChartConfig = Object.fromEntries(
  Object.entries(mockTopProductConfig).map(([key, label], index) => [
    key,
    { label, color: topProductColors[index] },
  ])
);

const arrangementRadarData = mockTopArrangements.map(arr => ({
  subject: arr.arrangement.split(' ')[0],
  sales: arr.sales,
  revenue: arr.revenue,
}));

const songKeysData = [...mockTopSongs].sort((a, b) => a.title.localeCompare(b.title));

function Stats() {
  return (
    <>
      <div className='grid lg:grid-cols-3 gap-6 min-w-0'>
        <Card className='border-border/50 min-w-0'>
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
                  data={categoryData}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                  stroke='hsl(var(--background))'
                >
                  {categoryData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.fill}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className='flex flex-wrap justify-center gap-3 mt-2'>
              {categoryData.map(c => (
                <div
                  key={c.name}
                  className='flex items-center gap-1.5 text-xs'
                >
                  <span
                    className='w-2.5 h-2.5 rounded-full'
                    style={{ backgroundColor: c.fill }}
                  />
                  {c.name} ({c.value}%)
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
                data={songKeysData}
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
                  ticks={[0, 40, 80, 120, 160]}
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
                  shape={args => <TopSongBar {...args} song={songKeysData[args.index]} />}
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
              <RadarChart data={arrangementRadarData} cx='50%' cy='50%'>
                <PolarGrid
                  strokeDasharray='3 3'
                  stroke='hsl(var(--foreground) / 0.15)'
                />
                <PolarAngleAxis
                  dataKey='subject'
                  fontSize={12}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--foreground) / 0.6)', fontWeight: 600 }}
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
                            {item.payload.sales}건 · {formatCurrency(item.payload.revenue)}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
              </RadarChart>
            </ChartContainer>

            <div className='divide-y divide-border/50'>
              {mockTopArrangements.map(arr => (
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
                        {arr.sales}건 · {formatCurrency(arr.revenue)}
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
          <CardTitle className='text-base font-display'>인기곡 월별 판매 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={topProductConfig}
            className='w-full h-[260px]'
          >
            <LineChart
              data={mockTopProductMonthlySales}
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
