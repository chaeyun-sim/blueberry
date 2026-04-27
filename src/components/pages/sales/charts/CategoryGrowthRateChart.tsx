import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { MonthlyCategoryData } from '@/types/stats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface CategoryGrowthRateChartProps {
	data: MonthlyCategoryData[];
	config: ChartConfig;
}

const CATS = ['CLASSIC', 'OST', 'ANI', 'ETC', 'POP', 'K-POP'] as const;

function CategoryGrowthRateChart({ data, config }: CategoryGrowthRateChartProps) {
  const normalizedData = data.map(d => {
    const total = CATS.reduce((s, cat) => s + ((d as Record<string, unknown>)[cat] as number ?? 0), 0);
    if (total === 0) return { month: d.month, ...Object.fromEntries(CATS.map(c => [c, 0])) };
    return {
      month: d.month,
      ...Object.fromEntries(
        CATS.map(cat => [cat, parseFloat((((d as Record<string, unknown>)[cat] as number ?? 0) / total * 100).toFixed(1))])
      ),
    };
  });

  return (
    <ChartContainer
      config={config}
      className='w-full h-[180px]'
    >
      <BarChart
        data={normalizedData}
        margin={{ left: -16, right: 8, top: 4, bottom: 4 }}
        barSize={21}
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
          tickFormatter={v => `${v}%`}
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            const activeCats = CATS.filter(cat => config[cat] && d[cat] > 0);
            return (
              <div className='rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md space-y-1'>
                <p className='font-semibold text-sm mb-1'>{d.month}</p>
                {activeCats.map(cat => (
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
                      {d[cat]}%
                    </span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        {CATS.filter(cat => config[cat]).map((cat, i, arr) => (
          <Bar
            key={cat}
            dataKey={cat}
            stackId='a'
            fill={`var(--color-${cat})`}
            radius={i === arr.length - 1 ? [4, 4, 0, 0] : undefined}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

export default CategoryGrowthRateChart;
