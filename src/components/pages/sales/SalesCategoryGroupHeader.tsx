import { ChevronDown, ChevronRight } from 'lucide-react';

interface SalesCategoryGroupHeaderProps {
	category: string;
	rowCount: number;
	collapsed: boolean;
	collapsible: boolean;
	onToggle: () => void;
}

export function SalesCategoryGroupHeader({
	category,
	rowCount,
	collapsed,
	collapsible,
	onToggle,
}: SalesCategoryGroupHeaderProps) {
	return (
		<button
			type='button'
			className='w-full flex items-center justify-between px-4 py-2 bg-muted/40 hover:bg-muted/60 cursor-pointer select-none border-b border-border/40'
			onClick={() => collapsible && onToggle()}
		>
			<div className='inline-flex items-center gap-2'>
				{collapsible &&
					(collapsed ? (
						<ChevronRight className='h-4 w-4 text-muted-foreground' />
					) : (
						<ChevronDown className='h-4 w-4 text-muted-foreground' />
					))}
				<span className='px-2 py-0.5 rounded-full text-xs bg-foreground text-background font-bold font-display'>
					{category}
				</span>
			</div>
			<span className='text-muted-foreground text-xs'>{rowCount}건</span>
		</button>
	);
}
