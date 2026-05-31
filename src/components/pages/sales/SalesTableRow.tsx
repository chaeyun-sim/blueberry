import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format-currency';

const COL = {
	idx: 'w-8 shrink-0',
	cat: 'flex-[0.8] min-w-0',
	song: 'flex-[2.5] min-w-0',
	arrangement: 'flex-[1.5] min-w-0',
	amount: 'flex-[1.2] min-w-0',
} as const;

const ROW_BASE =
	'flex items-center border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors';

interface SalesTableRowProps {
	idx: number;
	song: string;
	arrangement: string;
	amount: number;
	category?: string;
	showCategory?: boolean;
}

export function SalesTableRow({
	idx,
	song,
	arrangement,
	amount,
	category,
	showCategory = false,
}: SalesTableRowProps) {
	return (
		<div className={ROW_BASE}>
			<div className={cn(COL.idx, 'px-3 py-2.5 text-xs text-muted-foreground')}>{idx}</div>
			{showCategory && category !== undefined && (
				<div className={cn(COL.cat, 'px-3 py-2.5')}>
					<span className='px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground'>
						{category}
					</span>
				</div>
			)}
			<div className={cn(COL.song, 'px-3 py-2.5 font-medium text-sm truncate')}>{song}</div>
			<div className={cn(COL.arrangement, 'px-3 py-2.5 text-sm text-muted-foreground truncate')}>
				{arrangement}
			</div>
			<div className={cn(COL.amount, 'px-3 py-2.5 text-right tabular-nums text-sm')}>
				{formatCurrency(amount)}
			</div>
		</div>
	);
}
