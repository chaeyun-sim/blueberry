import { ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, MailCheck } from 'lucide-react';
import { Commission } from '@/types/commission';
import { abbreviateInstrument } from '@/utils/instrument';

interface CommissionDesktopTableProps {
	paged: Commission[];
	filter: string;
	sortDir: 'asc' | 'desc' | null;
	onSortToggle: () => void;
	onNavigate: (id: string) => void;
	emptyNode: ReactNode;
}

export function CommissionDesktopTable({
	paged,
	filter,
	sortDir,
	onSortToggle,
	onNavigate,
	emptyNode,
}: CommissionDesktopTableProps) {
	const SortIcon = sortDir === 'asc' ? ChevronUp : sortDir === 'desc' ? ChevronDown : ChevronsUpDown;

	return (
		<div className='hidden md:block bg-card rounded-3xl border shadow-sm overflow-hidden'>
			{paged.length === 0 ? (
				emptyNode
			) : (
				<table className='w-full table-fixed' aria-label='의뢰 목록'>
					<thead>
						<tr className='border-b border-border/50'>
							<th
								className='text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-6 py-3.5 w-[11%] cursor-pointer select-none'
								onClick={onSortToggle}
								aria-sort={
									sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none'
								}
							>
								<span className='inline-flex items-center gap-1'>
									마감일
									<SortIcon className='h-3 w-3' />
								</span>
							</th>
							<th className='text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-3.5 w-[26%]'>
								곡명
							</th>
							<th className='text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-3.5 w-[20%]'>
								작곡가
							</th>
							<th className='text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-3.5 w-[22%]'>
								편성
							</th>
							{filter !== 'cancelled' && (
								<th className='text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-3.5 w-[10%]'>
									버전
								</th>
							)}
							{filter === 'complete' && (
								<th className='text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-3.5 w-[11%]'>
									전달 여부
								</th>
							)}
						</tr>
					</thead>
					<tbody className='divide-y divide-border/30'>
						{paged.map((item) => (
							<tr
								key={item.id}
								role='button'
								tabIndex={0}
								className='cursor-pointer hover:bg-muted/20 transition-colors group'
								onClick={() => onNavigate(item.id)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										onNavigate(item.id);
									}
								}}
							>
								<td className='px-6 py-4 text-sm text-muted-foreground tabular-nums'>
									{item.deadline}
								</td>
								<td className='px-3 py-4 text-sm font-semibold truncate group-hover:text-primary transition-colors'>
									{item.songs?.title ?? item.title ?? '-'}
								</td>
								<td className='px-3 py-4 text-sm text-muted-foreground truncate'>
									{item.songs?.composer ?? item.composer ?? '-'}
								</td>
								<td className='px-3 py-4 text-sm text-muted-foreground'>
									{(item.arrangement ?? '').split(', ').map(abbreviateInstrument).join(', ')}
								</td>
								{filter !== 'cancelled' && (
									<td className='px-3 py-4 text-center'>
										{item.version ? (
											<span className='text-xs px-2 py-1 rounded-lg bg-warning/12 text-warning font-medium capitalize'>
												{item.version}
											</span>
										) : (
											<span className='text-muted-foreground text-sm'>-</span>
										)}
									</td>
								)}
								{filter === 'complete' && (
									<td className='px-3 py-4 text-sm text-muted-foreground'>
										{item.is_delivered ? <MailCheck className='h-4 w-4 mx-auto' /> : '-'}
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
