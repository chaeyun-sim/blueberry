import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { formatCurrency } from '@/utils/format-currency';
import { MONEY_RATIO } from '@/constants/money-ratio';
import { PieChart } from 'lucide-react';

function ParetoChart() {
  const { data: items = [] } = useQuery(statsQueries.getRevenueConcentration());

  const point80 = items.find(d => d.cumulativeShare >= 80);
  const point20 = items.find(d => d.songShare >= 20);

  const chartData = items.filter((_, i) => {
    if (items.length <= 50) return true;
    return i % Math.ceil(items.length / 50) === 0 || i === items.length - 1;
  });

  return (
    <Card className='border-border/50'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base font-display flex items-center gap-2'>
          <PieChart className='h-4 w-4' />
          매출 집중도 (파레토)
        </CardTitle>
        <p className='text-xs text-muted-foreground'>
          상위 몇 %의 곡이 전체 매출을 책임지는지
        </p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className='text-sm text-muted-foreground py-6 text-center'>데이터 없음</p>
        ) : (
          <>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div className='rounded-lg bg-muted/40 px-4 py-3 text-center'>
                <p className='text-2xl font-bold font-display tabular-nums'>
                  {point80?.songShare ?? 0}%
                </p>
                <p className='text-xs text-muted-foreground mt-0.5'>매출 80% 달성에 필요한 곡 비율</p>
              </div>
              <div className='rounded-lg bg-muted/40 px-4 py-3 text-center'>
                <p className='text-2xl font-bold font-display tabular-nums'>
                  {point20?.cumulativeShare ?? 0}%
                </p>
                <p className='text-xs text-muted-foreground mt-0.5'>상위 20% 곡의 매출 기여도</p>
              </div>
            </div>

            <ChartContainer
              config={{
                cumulativeShare: { label: '누적 매출 비중', color: 'hsl(var(--primary))' },
              }}
              className='w-full h-[200px]'
            >
              <LineChart
                data={chartData}
                margin={{ left: -8, right: 8, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis
                  dataKey='songShare'
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tickFormatter={v => `${v}%`}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tickFormatter={v => `${v}%`}
                  domain={[0, 100]}
                />
                <ReferenceLine
                  x={20}
                  stroke='hsl(var(--muted-foreground) / 0.4)'
                  strokeDasharray='4 2'
                />
                <ReferenceLine
                  y={80}
                  stroke='hsl(var(--muted-foreground) / 0.4)'
                  strokeDasharray='4 2'
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className='rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md space-y-0.5'>
                        <p className='font-semibold truncate max-w-[160px]'>{d.title}</p>
                        <p className='text-muted-foreground'>매출 {formatCurrency(d.revenue * MONEY_RATIO)}</p>
                        <p className='text-muted-foreground'>
                          상위 {d.songShare}% 곡 → 누적 {d.cumulativeShare}% 매출
                        </p>
                      </div>
                    );
                  }}
                />
                <Line
                  dataKey='cumulativeShare'
                  stroke='hsl(var(--primary))'
                  strokeWidth={2}
                  dot={false}
                  type='monotone'
                />
              </LineChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ParetoChart;
