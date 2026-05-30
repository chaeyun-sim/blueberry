import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { Layers } from 'lucide-react';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { categoryColors } from '@/constants/status-config';

const emptyState = (
	<p className='text-sm text-muted-foreground py-8 text-center'>
		데이터가 없습니다. 매출 데이터를 업로드하면 확인할 수 있어요.
	</p>
);

export function CategoryDistributionCard() {
	const { data: categoryDistribution } = useQuery(statsQueries.getCategoryDistribution());
	const hasData = (categoryDistribution?.length ?? 0) > 0;

	return (
		<Card className='border-border/50 min-w-0 flex flex-col'>
			<CardHeader className='pb-2'>
				<CardTitle className='text-base font-display flex items-center gap-2'>
					<Layers className='h-4 w-4' />
					카테고리별 분포
				</CardTitle>
				<p className='text-xs text-muted-foreground'>전체 판매 건수 기준</p>
			</CardHeader>
			<CardContent className='flex flex-col flex-1 justify-between gap-4'>
				{!hasData ? (
					emptyState
				) : (
					<>
						<ChartContainer config={{}} className='mx-auto h-[180px]'>
							<PieChart>
								<Pie
									data={categoryDistribution}
									dataKey='countShare'
									nameKey='name'
									cx='50%'
									cy='50%'
									innerRadius={48}
									outerRadius={78}
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
							</PieChart>
						</ChartContainer>

						<div className='border-t border-border/40 pt-[24px] pb-[16px]'>
							<div className='grid grid-cols-2 gap-2'>
								{categoryDistribution?.map((c) => (
									<div key={c.name} className='rounded-[14px] px-3 py-2 space-y-2 bg-muted/40'>
										<div className='flex items-center gap-1.5'>
											<span
												className='w-2 h-2 rounded-full shrink-0'
												style={{ backgroundColor: categoryColors[c.name] }}
											/>
											<span className='text-xs font-semibold'>{c.name}</span>
										</div>
										<p className='text-xs text-muted-foreground tabular-nums'>
											{c.countShare}% · {c.count.toLocaleString()}건
										</p>
									</div>
								))}
							</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
