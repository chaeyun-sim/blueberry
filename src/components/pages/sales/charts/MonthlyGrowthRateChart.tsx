import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatCurrency } from '@/utils/format-currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CategoricalChartProps } from 'recharts/types/chart/generateCategoricalChart';

interface MonthlyGrowthRateChartProps {
	data: CategoricalChartProps['data'];
	avgCount: number;
}

function MonthlyGrowthRateChart({ data, avgCount }: MonthlyGrowthRateChartProps) {
	const chartConfig: ChartConfig = {
		revenue: { label: '올해', color: 'hsl(var(--primary))' },
		prevRevenue: { label: '전년도', color: 'hsl(var(--muted-foreground) / 0.2)' },
	};
	
  return (
    <ChartContainer
      config={chartConfig}
      className='aspect-[2/1] w-full max-h-[300px]'
    >
      <BarChart data={data}>
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
          ticks={[0, 100000, 300000, 500000, 700000]}
          domain={[0, 700000]}
          tickFormatter={(v) => `${v / 10000}만`}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className='rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md space-y-1'>
                <p className='text-foreground font-medium'>
                  {formatCurrency(d.revenue)} · {d.count}건
                </p>
                {d.prevRevenue > 0 && (
                  <p className='text-muted-foreground'>
                    전년도 {formatCurrency(d.prevRevenue)} · {d.prevCount}건
                  </p>
                )}
                <p
                  style={{
                    color:
                      d.count >= avgCount
                        ? 'hsl(var(--status-complete))'
                        : 'hsl(var(--destructive))',
                  }}
                >
                  월평균 대비 {d.count - avgCount >= 0 ? '+' : ''}{d.count - avgCount}건
                </p>
              </div>
            );
          }}
        />
        <Bar
          dataKey='prevRevenue'
          fill='var(--color-prevRevenue)'
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey='revenue'
          fill='var(--color-revenue)'
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

export default MonthlyGrowthRateChart;
