import React, { ElementType,useCallback, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import {
	BarChart3,
	CalendarDays,
	DollarSign,
	FileSpreadsheet,
	Lightbulb,
	List,
	Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { statsMutations } from '@/api/stats/mutations';
import { statsQueries } from '@/api/stats/queries';
import { statsKeys } from '@/api/stats/queryKeys';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ExcelUploadDialog } from '@/components/ExcelUploadDialog';
import { AppLayout } from '@/components/layout/AppLayout';
import ParetoChart from '@/components/pages/sales/insights/ParetoChart';
import SalesForecast from '@/components/pages/sales/insights/SalesForecast';
import SeasonalHint from '@/components/pages/sales/insights/SeasonalHint';
import SalesAll from '@/components/pages/sales/SalesAll';
import SalesSummaryCard from '@/components/pages/sales/SalesSummaryCard';
import Stats from '@/components/pages/sales/Stats';
import YearlyStats from '@/components/pages/sales/YearlyStats';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { cn } from '@/lib/utils';
import { ExcelRow } from '@/types/excel';
import { getNetAmount } from '@/utils/getNetAmount';
import { queryClient } from '@/utils/query-client';

const InsightsTab = () => (
	<div className='space-y-6'>
		<SeasonalHint />
		<div className='grid lg:grid-cols-2 gap-6'>
			<div className='min-w-0'>
				<SalesForecast />
			</div>
			<div className='min-w-0'>
				<ParetoChart />
			</div>
		</div>
	</div>
);

const tabItems = [
	{ key: 'all', icon: BarChart3, label: '전체 분석', component: Stats },
	{
		key: 'yearly',
		icon: CalendarDays,
		label: '월별 분석',
		component: YearlyStats,
	},
	{
		key: 'insights',
		icon: Lightbulb,
		label: '인사이트',
		component: InsightsTab,
	},
	{ key: 'raw', icon: List, label: '전체 보기', component: SalesAll },
] satisfies {
	key: string;
	icon: ElementType;
	label: string;
	component: ElementType;
}[];

const SalesStatsContent = () => {
	const [uploadOpen, setUploadOpen] = useState(false);
	const [activeTab, setActiveTab] = useState('all');

	const { data: salesSummary } = useQuery(statsQueries.getSalesSummary());
	const { mutate: saveRows } = useMutation(statsMutations.saveSalesRows());

	const handleExcelUpload = useCallback(
		(data: ExcelRow[], name: string) => {
			saveRows(
				{ rows: data, name },
				{
					onSuccess: (_, { rows }) => {
						queryClient.invalidateQueries({ queryKey: statsKeys.all });
						toast.success(`${rows.length}건이 저장되었습니다.`);
					},
					onError: (e) =>
						toast.error('저장에 실패했습니다.', {
							description: e instanceof Error ? e.message : undefined,
						}),
				},
			);
		},
		[saveRows],
	);

	const ActiveComponent =
		tabItems.find((t) => t.key === activeTab)?.component ?? Stats;

	return (
		<AppLayout>
			{/* ── Header ─────────────────────────────────── */}
			<div className='flex items-center justify-between mb-6'>
				<div>
					<p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
						매출 통계
					</p>
					<h1 className='text-3xl font-display font-bold tracking-tight mt-0.5'>
						Sales Analytics
					</h1>
				</div>
				{/* md 이상: 기존 버튼 */}
				<button
					onClick={() => setUploadOpen(true)}
					className='hidden md:flex items-center gap-1.5 bg-card border text-foreground text-xs font-semibold px-5 py-2 rounded-2xl shadow-sm hover:bg-muted/30 transition-colors'
				>
					<Upload className='h-3.5 w-3.5' />
					엑셀 업로드
				</button>

				{/* 모바일: floating 원형 버튼 */}
				<button
					onClick={() => setUploadOpen(true)}
					style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom) + 1rem)' }}
					className='md:hidden fixed right-6 z-50 w-14 h-14 rounded-full bg-foreground text-background shadow-xl flex items-center justify-center hover:opacity-80 active:scale-95 transition-all'
					aria-label='엑셀 업로드'
				>
					<Upload className='h-5 w-5' />
				</button>
			</div>

			<ExcelUploadDialog
				open={uploadOpen}
				onOpenChange={setUploadOpen}
				onUpload={handleExcelUpload}
			/>

			{/* ── Summary Cards ───────────────────────────── */}
			<div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
				<SalesSummaryCard
					icon={DollarSign}
					title='총 매출'
					value={getNetAmount(salesSummary?.totalRevenue ?? 0)}
					isMoney
					className='col-span-2 lg:col-span-1 order-1 lg:order-none'
				/>
				<SalesSummaryCard
					icon={CalendarDays}
					title='지난달 매출'
					value={getNetAmount(salesSummary?.lastMonthRevenue ?? 0)}
					percentage={salesSummary?.revenueVsLastMonth ?? 0}
					compareKey='lastMonth'
					isMoney
					className='col-span-2 lg:col-span-1 order-2 lg:order-none'
				/>
				<SalesSummaryCard
					icon={FileSpreadsheet}
					title='올해 판매건'
					value={salesSummary?.thisYearCount ?? 0}
					percentage={salesSummary?.countVsLastYear ?? 0}
					compareKey='lastYear'
					className='order-3 lg:order-none'
				/>
				<SalesSummaryCard
					icon={FileSpreadsheet}
					title='지난달 판매건'
					value={salesSummary?.lastMonthCount ?? 0}
					percentage={salesSummary?.countVsLastMonth ?? 0}
					compareKey='lastMonth'
					className='order-4 lg:order-none'
				/>
			</div>

			{/* ── Tabs ────────────────────────────────────── */}
			<div className='flex items-center gap-1 bg-card border rounded-2xl shadow-sm p-1 w-fit mb-6'>
				{tabItems.map(({ key, icon: Icon, label }) => (
					<button
						key={key}
						onClick={() => setActiveTab(key)}
						className={cn(
							'flex items-center gap-1.5 px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-xl transition-colors',
							activeTab === key
								? 'bg-foreground text-background font-semibold shadow-sm'
								: 'text-muted-foreground hover:text-foreground',
						)}
					>
						<Icon className='h-3 w-3 md:h-3.5 md:w-3.5 shrink-0' />
						<span className='whitespace-nowrap'>{label}</span>
					</button>
				))}
			</div>

			{/* ── Tab Content ─────────────────────────────── */}
			<ActiveComponent />
		</AppLayout>
	);
};

const SalesStats = () => (
	<ErrorBoundary level='page'>
		<SalesStatsContent />
	</ErrorBoundary>
);

export default SalesStats;
