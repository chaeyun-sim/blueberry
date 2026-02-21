import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { SVGAttributes } from 'react';
import { AreaChart, Area, ReferenceLine, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CategoricalChartProps } from 'recharts/types/chart/generateCategoricalChart';

interface GrowthRateChartProps {
	data: CategoricalChartProps['data'];
	offset: SVGAttributes<SVGStopElement>['offset']
}

function GrowthRateChart({ data, offset }: GrowthRateChartProps) {
	const chartConfig: ChartConfig = {
		growth: { label: '성장률' },
	};
	
  return (
    <ChartContainer
      config={chartConfig}
      className='w-full h-[220px]'
    >
      <AreaChart
        data={data}
        margin={{ left: -16, right: 8, top: 8, bottom: 4 }}
      >
        <defs>
          <linearGradient
            id='growthFill'
            x1='0'
            y1='0'
            x2='0'
            y2='1'
          >
            <stop
              offset='0%'
              stopColor='hsl(var(--status-complete))'
              stopOpacity={0.4}
            />
            <stop
              offset={offset}
              stopColor='hsl(var(--status-complete))'
              stopOpacity={0.05}
            />
            <stop
              offset={offset}
              stopColor='hsl(var(--destructive))'
              stopOpacity={0.05}
            />
            <stop
              offset='100%'
              stopColor='hsl(var(--destructive))'
              stopOpacity={0.4}
            />
          </linearGradient>
          <linearGradient
            id='growthStroke'
            x1='0'
            y1='0'
            x2='0'
            y2='1'
          >
            <stop
              offset={offset}
              stopColor='hsl(var(--status-complete))'
            />
            <stop
              offset={offset}
              stopColor='hsl(var(--destructive))'
            />
          </linearGradient>
        </defs>
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
        />
        <ReferenceLine
          y={0}
          stroke='hsl(var(--border))'
          strokeWidth={1.5}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, _, item) => (
                <div className='flex items-center gap-1.5'>
                  <span className='font-medium'>{item.payload.month}</span>
                  <span
                    style={{
                      color:
                        (value as number) >= 0
                          ? 'hsl(var(--status-complete))'
                          : 'hsl(var(--destructive))',
                    }}
                  >
                    {(value as number) >= 0 ? '+' : ''}
                    {value}%
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
  );
}

export default GrowthRateChart;
