import { Search, CalendarDays, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DateRange } from '@/utils/commission-utils';
import { tabs } from '@/hooks/use-commission-list-filters';

const dateRangeOptions: { label: string; value: DateRange }[] = [
	{ label: '전체', value: 'all' },
	{ label: '이번 주', value: 'week' },
	{ label: '이번 달', value: 'month' },
];

interface CommissionFilterBarProps {
	filter: string;
	counts: Record<string, number>;
	dateRange: DateRange;
	search: string;
	onStatusChange: (status: string) => void;
	onDateRangeChange: (range: DateRange) => void;
	onSearchChange: (value: string) => void;
}

export function CommissionFilterBar({
	filter,
	counts,
	dateRange,
	search,
	onStatusChange,
	onDateRangeChange,
	onSearchChange,
}: CommissionFilterBarProps) {
	return (
		<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4'>
			<div className='flex items-center gap-2'>
				<div className='flex items-center gap-1 bg-card border rounded-2xl shadow-sm p-1'>
					{tabs.map((tab) => (
						<button
							key={tab.value}
							onClick={() => onStatusChange(tab.value)}
							className={cn(
								'px-3 py-1.5 text-sm rounded-xl transition-colors',
								filter === tab.value
									? 'bg-foreground text-background font-semibold shadow-sm'
									: 'text-muted-foreground hover:text-foreground',
							)}
						>
							{tab.label}
							{counts[tab.value] > 0 && (
								<span
									className={cn(
										'ml-1.5 text-xs tabular-nums',
										filter === tab.value ? 'text-background/60' : 'text-muted-foreground',
									)}
								>
									{counts[tab.value]}
								</span>
							)}
						</button>
					))}
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							className={cn(
								'flex items-center gap-1.5 px-3 py-2 rounded-2xl border bg-card shadow-sm text-xs font-medium transition-colors',
								dateRange !== 'all'
									? 'text-foreground'
									: 'text-muted-foreground hover:text-foreground',
							)}
						>
							<CalendarDays className='h-3.5 w-3.5' />
							{dateRangeOptions.find((o) => o.value === dateRange)?.label}
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='start' className='w-32'>
						{dateRangeOptions.map((opt) => (
							<DropdownMenuItem
								key={opt.value}
								onClick={() => onDateRangeChange(opt.value)}
								className='flex items-center justify-between'
							>
								{opt.label}
								{dateRange === opt.value && <Check className='h-3.5 w-3.5' />}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className='relative w-full sm:w-60'>
				<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
				<Input
					placeholder='곡명, 작곡가, 편성...'
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className='pl-9 text-sm rounded-2xl border bg-card shadow-sm'
					aria-label='검색'
				/>
			</div>
		</div>
	);
}
