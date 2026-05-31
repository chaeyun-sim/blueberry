import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommissionPaginationProps {
	safePage: number;
	totalPages: number;
	totalCount: number;
	onPageChange: (updater: (p: number) => number) => void;
	getPaginationPages: (current: number, total: number) => (number | '...')[];
}

export function CommissionPagination({
	safePage,
	totalPages,
	totalCount,
	onPageChange,
	getPaginationPages,
}: CommissionPaginationProps) {
	if (totalPages <= 1) return null;

	return (
		<div className='flex items-center justify-between mt-4 px-1'>
			<p className='text-xs text-muted-foreground'>총 {totalCount}건</p>
			<div className='flex items-center gap-1'>
				<button
					onClick={() => onPageChange((p) => Math.max(1, p - 1))}
					disabled={safePage === 1}
					aria-label='이전 페이지'
					className='p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors'
				>
					<ChevronLeft className='h-4 w-4' />
				</button>
				{getPaginationPages(safePage, totalPages).map((p, i) =>
					p === '...' ? (
						<span key={`e-${i}`} className='px-1 text-sm text-muted-foreground'>
							…
						</span>
					) : (
						<button
							key={p}
							onClick={() => onPageChange(() => p)}
							className={cn(
								'min-w-[32px] h-8 px-2 rounded-xl text-sm transition-colors',
								safePage === p
									? 'bg-foreground text-background font-semibold'
									: 'text-muted-foreground hover:text-foreground hover:bg-muted',
							)}
						>
							{p}
						</button>
					),
				)}
				<button
					onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
					disabled={safePage === totalPages}
					aria-label='다음 페이지'
					className='p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors'
				>
					<ChevronRight className='h-4 w-4' />
				</button>
			</div>
		</div>
	);
}
