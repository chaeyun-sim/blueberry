import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/pages/commission/StatusBadge';
import { Input } from '@/components/ui/input';
import {
	Search,
	AlertCircle,
	ChevronUp,
	ChevronDown,
	ChevronsUpDown,
	Plus,
	CalendarDays,
	Check,
	ChevronLeft,
	ChevronRight,
	MailCheck,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { abbreviateInstrument } from '@/utils/instrument';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CommissionListSkeleton } from '@/components/pages/commission/CommissionListSkeleton';
import { DateRange } from '@/utils/commission-utils';
import { useCommissionListFilters, tabs } from '@/hooks/use-commission-list-filters';

const dateRangeOptions: { label: string; value: DateRange }[] = [
	{ label: '전체', value: 'all' },
	{ label: '이번 주', value: 'week' },
	{ label: '이번 달', value: 'month' },
];

const CommissionListContent = () => {
	const {
		navigate,
		filter,
		setSearchParams,
		search,
		setSearch,
		sortDir,
		toggleSort,
		dateRange,
		setDateRange,
		page,
		setPage,
		isLoading,
		isFetching,
		isError,
		refetch,
		currentTabLabel,
		counts,
		filtered,
		paged,
		totalPages,
		safePage,
		getPaginationPages,
	} = useCommissionListFilters();

	const SortIcon = sortDir === 'asc' ? ChevronUp : sortDir === 'desc' ? ChevronDown : ChevronsUpDown;

	if (isLoading) return <CommissionListSkeleton />;

	if (isError) {
		return (
			<AppLayout>
				<div className='flex items-center justify-between mb-6'>
					<div>
						<p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>의뢰 목록</p>
						<h1 className='text-3xl font-display font-bold tracking-tight mt-0.5'>오류</h1>
					</div>
				</div>
				<div className='bg-card rounded-3xl border shadow-sm p-6 flex items-center gap-4'>
					<AlertCircle className='h-7 w-7 text-destructive shrink-0' />
					<div className='flex-1'>
						<p className='font-semibold text-destructive'>의뢰 목록을 불러올 수 없습니다</p>
						<p className='text-sm text-muted-foreground mt-0.5'>잠시 후 다시 시도해주세요.</p>
					</div>
					<Button disabled={isFetching} onClick={() => refetch()}>
						{isFetching ? '로딩 중...' : '다시 시도'}
					</Button>
				</div>
			</AppLayout>
		);
	}

	const emptyNode = (
		<div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
			<p className='text-sm mb-3'>
				{search ? `"${search}"에 해당하는 의뢰가 없어요.` : '의뢰가 없어요.'}
			</p>
			{search ? (
				<button onClick={() => setSearch('')} className='text-sm text-primary hover:underline underline-offset-4'>
					검색 초기화
				</button>
			) : (
				<button
					onClick={() => navigate('/new')}
					className='flex items-center gap-1.5 bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-2xl hover:opacity-80 transition-opacity'
				>
					<Plus className='h-3.5 w-3.5' />
					새 의뢰 등록
				</button>
			)}
		</div>
	);

	return (
		<AppLayout>
			{/* ── Header ─────────────────────────────────── */}
			<div className='flex items-center justify-between mb-6'>
				<div>
					<p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
						의뢰 목록
					</p>
					<h1 className='text-3xl font-display font-bold tracking-tight mt-0.5'>
						{currentTabLabel}
						<span className='text-xl text-muted-foreground font-normal ml-2 tabular-nums'>
							{counts[filter]}
						</span>
					</h1>
				</div>
			</div>

			{/* ── Filter bar ─────────────────────────────── */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4'>
				<div className='flex items-center gap-2'>
					<div className='flex items-center gap-1 bg-card border rounded-2xl shadow-sm p-1'>
						{tabs.map((tab) => (
							<button
								key={tab.value}
								onClick={() => setSearchParams({ status: tab.value })}
								className={cn(
									'px-3 py-1.5 text-sm rounded-xl transition-colors',
									filter === tab.value
										? 'bg-foreground text-background font-semibold shadow-sm'
										: 'text-muted-foreground hover:text-foreground',
								)}
							>
								{tab.label}
								{counts[tab.value] > 0 && (
									<span className={cn(
										'ml-1.5 text-xs tabular-nums',
										filter === tab.value ? 'text-background/60' : 'text-muted-foreground',
									)}>
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
									dateRange !== 'all' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
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
									onClick={() => setDateRange(opt.value)}
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
						onChange={(e) => setSearch(e.target.value)}
						className='pl-9 text-sm rounded-2xl border bg-card shadow-sm'
						aria-label='검색'
					/>
				</div>
			</div>

			{/* ── Mobile: 카드 뷰 ─────────────────────────── */}
			<div className='md:hidden space-y-2'>
				{filtered.length === 0 ? emptyNode : paged.map((item) => (
					<button
						key={item.id}
						onClick={() => navigate(`/commissions/${item.id}`)}
						className='w-full flex items-center justify-between gap-3 px-4 py-4 rounded-2xl bg-card border shadow-sm hover:bg-muted/30 transition-colors text-left group'
					>
						<div className='min-w-0 flex-1'>
							<p className='font-semibold text-sm truncate group-hover:text-primary transition-colors'>
								{item.songs?.title ?? item.title ?? '-'}
							</p>
							<p className='text-[11px] text-muted-foreground mt-0.5 truncate'>
								{[item.songs?.composer ?? item.composer, item.arrangement].filter(Boolean).join(' · ')}
							</p>
						</div>
						<div className='flex items-center gap-2 shrink-0'>
							<StatusBadge status={item.status} />
							<span className='text-[10px] text-muted-foreground'>{item.deadline}</span>
						</div>
					</button>
				))}
			</div>

			{/* ── Desktop: 테이블 뷰 ─────────────────────── */}
			<div className='hidden md:block bg-card rounded-3xl border shadow-sm overflow-hidden'>
				{filtered.length === 0 ? emptyNode : (
					<table className='w-full table-fixed' aria-label='의뢰 목록'>
						<thead>
							<tr className='border-b border-border/50'>
								<th
									className='text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-6 py-3.5 w-[11%] cursor-pointer select-none'
									onClick={toggleSort}
									aria-sort={sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none'}
								>
									<span className='inline-flex items-center gap-1'>
										마감일
										<SortIcon className='h-3 w-3' />
									</span>
								</th>
								<th className='text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-3.5 w-[26%]'>곡명</th>
								<th className='text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-3.5 w-[20%]'>작곡가</th>
								<th className='text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-3.5 w-[22%]'>편성</th>
								{filter !== 'cancelled' && (
									<th className='text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-3.5 w-[10%]'>버전</th>
								)}
								{filter === 'complete' && (
									<th className='text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-3.5 w-[11%]'>전달 여부</th>
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
									onClick={() => navigate(`/commissions/${item.id}`)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/commissions/${item.id}`); }
									}}
								>
									<td className='px-6 py-4 text-sm text-muted-foreground tabular-nums'>{item.deadline}</td>
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

			{/* ── Pagination ──────────────────────────────── */}
			{totalPages > 1 && (
				<div className='flex items-center justify-between mt-4 px-1'>
					<p className='text-xs text-muted-foreground'>총 {filtered.length}건</p>
					<div className='flex items-center gap-1'>
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={safePage === 1}
							aria-label='이전 페이지'
							className='p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors'
						>
							<ChevronLeft className='h-4 w-4' />
						</button>
						{getPaginationPages(safePage, totalPages).map((p, i) =>
							p === '...' ? (
								<span key={`e-${i}`} className='px-1 text-sm text-muted-foreground'>…</span>
							) : (
								<button
									key={p}
									onClick={() => setPage(p)}
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
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={safePage === totalPages}
							aria-label='다음 페이지'
							className='p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors'
						>
							<ChevronRight className='h-4 w-4' />
						</button>
					</div>
				</div>
			)}
		</AppLayout>
	);
};

const CommissionList = () => (
	<ErrorBoundary level='page'>
		<CommissionListContent />
	</ErrorBoundary>
);

export default CommissionList;
