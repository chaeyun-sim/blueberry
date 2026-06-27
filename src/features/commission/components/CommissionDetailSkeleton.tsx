import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const CommissionDetailSkeleton = () => (
	<AppLayout>
		<div className='mb-6 flex items-center justify-between' role='status'>
			<Skeleton className='h-9 w-16' />
			<Skeleton className='h-9 w-16' />
		</div>
		<Skeleton className='h-8 w-48 mb-8' />
		<Card className='mb-8 border-border/50'>
			<CardContent className='p-6'>
				<div className='flex items-center justify-between w-full'>
					{[0, 1, 2, 3].map((i) => (
						<div key={i} className='flex items-center flex-1'>
							<div className='flex flex-col items-center'>
								<Skeleton className='w-10 h-10 rounded-full' />
								<Skeleton className='h-3 w-10 mt-2' />
							</div>
							{i < 3 && <Skeleton className='flex-1 h-0.5 mx-3' />}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
		<Card className='border-border/50'>
			<CardContent className='p-5 space-y-4'>
				<Skeleton className='h-5 w-20' />
				{[0, 1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className='flex items-center justify-between py-2 border-b border-border/50 last:border-0'
					>
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-24' />
					</div>
				))}
			</CardContent>
		</Card>
	</AppLayout>
);
