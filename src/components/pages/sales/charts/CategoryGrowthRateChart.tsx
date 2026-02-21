import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatCurrency } from '@/utils/format-currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CategoricalChartProps } from 'recharts/types/chart/generateCategoricalChart';

interface CategoryGrowthRateChartProps {
	data: CategoricalChartProps['data'];
	config: ChartConfig;
}

function CategoryGrowthRateChart({ data, config }: CategoryGrowthRateChartProps) {
  return (
    <ChartContainer
      config={config}
      className='w-full h-[220px]'
    >
      <BarChart
        data={data}
        margin={{ left: -16, right: 8, top: 4, bottom: 4 }}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray='3 3'
        />
        <XAxis
          dataKey='month'
          tickLine={false}
          axisLine={false}
          fontSize={11}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={11}
          tickFormatter={v => `${(v / 10000).toFixed(0)}만`}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            const total = d.CLASSIC + d.OST + d.ANI + d.ETC || 1;
            return (
              <div className='rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md space-y-1'>
                <p className='font-semibold text-sm mb-1'>{d.month}</p>
                {(['CLASSIC', 'OST', 'ANI', 'ETC'] as const).map(cat => (
                  <div
                    key={cat}
                    className='flex items-center justify-between gap-4'
                  >
                    <span className='flex items-center gap-1.5'>
                      <span
                        className='w-2 h-2 rounded-sm'
                        style={{ backgroundColor: config[cat].color }}
                      />
                      {cat}
                    </span>
                    <span className='tabular-nums text-muted-foreground'>
                      {formatCurrency(d[cat])} · {Math.round((d[cat] / total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        <Bar
          dataKey='CLASSIC'
          stackId='a'
          fill='var(--color-CLASSIC)'
        />
        <Bar
          dataKey='OST'
          stackId='a'
          fill='var(--color-OST)'
        />
        <Bar
          dataKey='ANI'
          stackId='a'
          fill='var(--color-ANI)'
        />
        <Bar
          dataKey='ETC'
          stackId='a'
          fill='var(--color-ETC)'
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

export default CategoryGrowthRateChart;
