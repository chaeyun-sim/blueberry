import { AppLayout } from '@/components/layout/AppLayout';

export const CommissionListSkeleton = () => (
	<AppLayout>
		<div className='flex items-center justify-between mb-6'>
			<div>
				<p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
					의뢰 목록
				</p>
				<h1 className='text-3xl font-display font-bold tracking-tight mt-0.5'>
					불러오는 중...
				</h1>
			</div>
		</div>
		<div className='bg-card rounded-3xl border shadow-sm overflow-hidden'>
			<div className='divide-y divide-border/40'>
				{[0, 1, 2, 3, 4].map((i) => (
					<div key={i} className='flex gap-6 px-6 py-4'>
						{[10, 24, 18, 16, 8].map((w, j) => (
							<div
								key={j}
								className='h-4 rounded-lg bg-muted animate-pulse'
								style={{ width: `${w}%` }}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	</AppLayout>
);
