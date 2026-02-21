import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, ReferenceLine } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { monthlySalesData, monthlyCategoryData } from '@/mock/sales';
import { formatCurrency } from '@/utils/format-currency';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const barChartConfig: ChartConfig = {
  revenue: { label: '매출', color: 'hsl(var(--primary))' },
  avgRevenue: { label: '총 평균', color: 'hsl(var(--muted-foreground) / 0.2)' },
};

const categoryChartConfig: ChartConfig = {
  CLASSIC: { label: 'CLASSIC', color: 'hsl(var(--status-complete))' },
  OST:     { label: 'OST',     color: 'hsl(var(--status-complete) / 0.72)' },
  ANI:     { label: 'ANI',     color: 'hsl(var(--status-complete) / 0.48)' },
  ETC:     { label: 'ETC',     color: 'hsl(var(--status-complete) / 0.28)' },
};

const growthChartConfig: ChartConfig = {
  growth: { label: '성장률' },
};

const avgCount = Math.round(
  monthlySalesData.reduce((sum, d) => sum + d.count, 0) / monthlySalesData.length
);
const avgRevenue = Math.round(
  monthlySalesData.reduce((sum, d) => sum + d.revenue, 0) / monthlySalesData.length
);
const monthlySalesWithAvg = monthlySalesData.map(d => ({ ...d, avgRevenue }));

const growthData = monthlySalesData.map(d => ({
  month: d.month,
  growth: parseFloat((((d.revenue - d.prevRevenue) / d.prevRevenue) * 100).toFixed(1)),
}));

const maxGrowth = Math.max(...growthData.map(d => d.growth));
const minGrowth = Math.min(...growthData.map(d => d.growth));
const zeroOffset = `${((maxGrowth / (maxGrowth - minGrowth)) * 100).toFixed(1)}%`;

function YearlyStats() {
  return (
    <>
      <div className='flex items-center gap-3 mb-2'>
        <Select defaultValue='2026'>
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='2026'>2026년</SelectItem>
            <SelectItem value='2025'>2025년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className='border-border/50'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base font-display'>월별 매출 추이</CardTitle>
            <div className='flex items-center gap-4'>
              <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <span className='w-2 h-2 rounded-full bg-primary inline-block' />
                올해
              </span>
              <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <span className='w-2 h-2 rounded-full bg-muted-foreground/40 inline-block' />
                총 평균
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={barChartConfig}
            className='aspect-[2/1] w-full max-h-[300px]'
          >
            <BarChart data={monthlySalesWithAvg}>
              <CartesianGrid
                vertical={false}
                strokeDasharray='3 3'
              />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={v => `${(v / 10000).toFixed(0)}만`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className='rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md space-y-1'>
                      <p className='text-foreground font-medium'>{formatCurrency(d.revenue)} · {d.count}건</p>
                      <p style={{ color: d.count >= avgCount ? 'hsl(var(--status-complete))' : 'hsl(var(--destructive))' }}>
                        평균 대비 {d.count - avgCount >= 0 ? '+' : ''}{d.count - avgCount}건
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey='avgRevenue'
                fill='var(--color-avgRevenue)'
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='revenue'
                fill='var(--color-revenue)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className='grid lg:grid-cols-2 gap-6'>
        <Card className='border-border/50'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base font-display'>카테고리별 월 매출 비중</CardTitle>
              <div className='flex items-center gap-3'>
                {Object.entries(categoryChartConfig).map(([key, cfg]) => (
                  <span key={key} className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <span className='w-2 h-2 rounded-sm inline-block' style={{ backgroundColor: cfg.color }} />
                    {cfg.label}
                  </span>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryChartConfig} className='w-full h-[220px]'>
              <BarChart data={monthlyCategoryData} margin={{ left: -16, right: 8, top: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis dataKey='month' tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    const total = d.CLASSIC + d.OST + d.ANI + d.ETC;
                    return (
                      <div className='rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md space-y-1'>
                        <p className='font-semibold text-sm mb-1'>{d.month}</p>
                        {(['CLASSIC', 'OST', 'ANI', 'ETC'] as const).map(cat => (
                          <div key={cat} className='flex items-center justify-between gap-4'>
                            <span className='flex items-center gap-1.5'>
                              <span className='w-2 h-2 rounded-sm' style={{ backgroundColor: categoryChartConfig[cat].color }} />
                              {cat}
                            </span>
                            <span className='tabular-nums text-muted-foreground'>
                              {formatCurrency(d[cat])} · {Math.round(d[cat] / total * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar dataKey='CLASSIC' stackId='a' fill='var(--color-CLASSIC)' />
                <Bar dataKey='OST'     stackId='a' fill='var(--color-OST)' />
                <Bar dataKey='ANI'     stackId='a' fill='var(--color-ANI)' />
                <Bar dataKey='ETC'     stackId='a' fill='var(--color-ETC)' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className='border-border/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base font-display'>전년 대비 월별 성장률</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthChartConfig} className='w-full h-[220px]'>
              <AreaChart data={growthData} margin={{ left: -16, right: 8, top: 8, bottom: 4 }}>
                <defs>
                  <linearGradient id='growthFill' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='hsl(var(--status-complete))' stopOpacity={0.4} />
                    <stop offset={zeroOffset} stopColor='hsl(var(--status-complete))' stopOpacity={0.05} />
                    <stop offset={zeroOffset} stopColor='hsl(var(--destructive))' stopOpacity={0.05} />
                    <stop offset='100%' stopColor='hsl(var(--destructive))' stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id='growthStroke' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset={zeroOffset} stopColor='hsl(var(--status-complete))' />
                    <stop offset={zeroOffset} stopColor='hsl(var(--destructive))' />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis dataKey='month' tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={v => `${v}%`}
                />
                <ReferenceLine y={0} stroke='hsl(var(--border))' strokeWidth={1.5} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, _, item) => (
                        <div className='flex items-center gap-1.5'>
                          <span className='font-medium'>{item.payload.month}</span>
                          <span style={{ color: (value as number) >= 0 ? 'hsl(var(--status-complete))' : 'hsl(var(--destructive))' }}>
                            {(value as number) >= 0 ? '+' : ''}{value}%
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Area
                  dataKey='growth'
                  fill='url(#growthFill)'
                  stroke='url(#growthStroke)'
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default YearlyStats;
