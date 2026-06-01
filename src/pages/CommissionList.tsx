import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/pages/commission/StatusBadge';
import { AlertCircle, Plus } from 'lucide-react';
import Button from '@/components/ui/button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CommissionListSkeleton } from '@/components/pages/commission/CommissionListSkeleton';
import { useCommissionListFilters } from '@/hooks/use-commission-list-filters';
import { CommissionFilterBar } from '@/components/pages/commission/CommissionFilterBar';
import { CommissionDesktopTable } from '@/components/pages/commission/CommissionDesktopTable';
import { CommissionPagination } from '@/components/pages/commission/CommissionPagination';

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

	if (isLoading) return <CommissionListSkeleton />;

	if (isError) {
		return (
			<AppLayout>
				<div className='flex items-center justify-between mb-6'>
					<div>
						<p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
							의뢰 목록
						</p>
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
				<button
					onClick={() => setSearch('')}
					className='text-sm text-primary hover:underline underline-offset-4'
				>
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
			<CommissionFilterBar
				filter={filter}
				counts={counts}
				dateRange={dateRange}
				search={search}
				onStatusChange={(status) => setSearchParams({ status })}
				onDateRangeChange={setDateRange}
				onSearchChange={setSearch}
			/>

			{/* ── Mobile: 카드 뷰 ─────────────────────────── */}
			<div className='md:hidden space-y-2'>
				{filtered.length === 0
					? emptyNode
					: paged.map((item) => (
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
										{[item.songs?.composer ?? item.composer, item.arrangement]
											.filter(Boolean)
											.join(' · ')}
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
			<CommissionDesktopTable
				paged={paged}
				filter={filter}
				sortDir={sortDir}
				onSortToggle={toggleSort}
				onNavigate={(id) => navigate(`/commissions/${id}`)}
				emptyNode={filtered.length === 0 ? emptyNode : null}
			/>

			{/* ── Pagination ──────────────────────────────── */}
			<CommissionPagination
				safePage={safePage}
				totalPages={totalPages}
				totalCount={filtered.length}
				onPageChange={setPage}
				getPaginationPages={getPaginationPages}
			/>
		</AppLayout>
	);
};

const CommissionList = () => (
	<ErrorBoundary level='page'>
		<CommissionListContent />
	</ErrorBoundary>
);

export default CommissionList;
