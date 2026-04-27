import { useState, useCallback } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Music, Sheet, PlusCircle, Upload } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { ExcelUploadDialog } from '@/components/ExcelUploadDialog';
import { ExcelRow } from '@/types/excel';
import { statsMutations } from '@/api/stats/mutations';
import { statsKeys } from '@/api/stats/queryKeys';
import ScoreTab from '@/components/pages/scores/ScoreTab';
import ExcelTab from '@/components/pages/uploads/ExcelTab';
import { queryClient } from '@/utils/query-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const tabs = [
	{ key: 'scores', icon: Music,  label: '악보 관리' },
	{ key: 'excel',  icon: Sheet,  label: '엑셀 관리' },
];

const FilesContent = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get('tab') ?? 'scores';
	const setActiveTab = (tab: string) => setSearchParams({ tab }, { replace: true });

	const [uploadOpen, setUploadOpen] = useState(false);
	const { mutate: saveRows } = useMutation(statsMutations.saveSalesRows());

	const handleUpload = useCallback(
		(data: ExcelRow[], name: string) => {
			saveRows(
				{ rows: data, name },
				{
					onSuccess: (_, { rows }) => {
						queryClient.invalidateQueries({ queryKey: statsKeys.all });
						toast.success(`"${name}" — ${rows.length}건이 저장되었습니다.`);
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

	return (
		<AppLayout>
			{/* ── Header ─────────────────────────────────── */}
			<div className='flex items-center justify-between mb-6'>
				<div>
					<p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
						파일 관리
					</p>
					<h1 className='text-3xl font-display font-bold tracking-tight mt-0.5'>
						{activeTab === 'scores' ? '악보 관리' : '엑셀 관리'}
					</h1>
				</div>

				<div className='hidden md:block'>
					{activeTab === 'scores' ? (
						<button
							onClick={() => navigate('/scores/new')}
							className='flex items-center gap-1.5 bg-foreground text-background text-xs font-semibold px-5 py-2 rounded-2xl hover:opacity-80 transition-opacity'
						>
							<PlusCircle className='h-3.5 w-3.5' />
							악보 추가
						</button>
					) : (
						<button
							onClick={() => setUploadOpen(true)}
							className='flex items-center gap-1.5 bg-card border text-foreground text-xs font-semibold px-5 py-2 rounded-2xl shadow-sm hover:bg-muted/30 transition-colors'
						>
							<Upload className='h-3.5 w-3.5' />
							엑셀 업로드
						</button>
					)}
				</div>
			</div>

			<ExcelUploadDialog
				open={uploadOpen}
				onOpenChange={setUploadOpen}
				onUpload={handleUpload}
			/>

			{/* ── Tabs ────────────────────────────────────── */}
			<div className='flex items-center gap-1 bg-card border rounded-2xl shadow-sm p-1 w-fit mb-6'>
				{tabs.map(({ key, icon: Icon, label }) => (
					<button
						key={key}
						onClick={() => setActiveTab(key)}
						className={cn(
							'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition-colors',
							activeTab === key
								? 'bg-foreground text-background font-semibold shadow-sm'
								: 'text-muted-foreground hover:text-foreground',
						)}
					>
						<Icon className='h-3.5 w-3.5' />
						{label}
					</button>
				))}
			</div>

			{/* ── Tab Content ─────────────────────────────── */}
			{activeTab === 'scores' && <ScoreTab />}
			{activeTab === 'excel' && <ExcelTab onUploadRequest={() => setUploadOpen(true)} />}

			{/* ── Mobile FAB ──────────────────────────────── */}
			<div className='md:hidden fixed bottom-5 left-6 right-6'>
				{activeTab === 'scores' ? (
					<button
						onClick={() => navigate('/scores/new')}
						className='flex items-center justify-center gap-2 w-full bg-foreground text-background text-sm font-semibold py-3 rounded-2xl hover:opacity-80 transition-opacity shadow-lg'
					>
						<PlusCircle className='h-4 w-4' />
						악보 추가
					</button>
				) : (
					<button
						onClick={() => setUploadOpen(true)}
						className='flex items-center justify-center gap-2 w-full bg-foreground text-background text-sm font-semibold py-3 rounded-2xl hover:opacity-80 transition-opacity shadow-lg'
					>
						<Upload className='h-4 w-4' />
						엑셀 업로드
					</button>
				)}
			</div>
		</AppLayout>
	);
};

const Files = () => (
	<ErrorBoundary level='page'>
		<FilesContent />
	</ErrorBoundary>
);

export default Files;
