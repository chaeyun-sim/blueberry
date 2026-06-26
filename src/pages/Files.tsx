import { useMutation } from '@tanstack/react-query';
import { Music, Plus, PlusCircle, Sheet, Upload, X } from 'lucide-react';
import { useCallback, useEffect,useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { statsMutations } from '@/api/stats/mutations';
import { statsKeys } from '@/api/stats/queryKeys';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ExcelUploadDialog } from '@/components/ExcelUploadDialog';
import { AppLayout } from '@/components/layout/AppLayout';
import ScoreTab from '@/components/pages/scores/ScoreTab';
import ExcelTab from '@/components/pages/uploads/ExcelTab';
import { cn } from '@/lib/utils';
import { ExcelRow } from '@/types/excel';
import { queryClient } from '@/utils/query-client';

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
	const [fabOpen, setFabOpen] = useState(false);
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

	// 외부 클릭 / Escape 키로 FAB 닫기
	useEffect(() => {
		if (!fabOpen) return;
		const close = () => setFabOpen(false);
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFabOpen(false); };
		document.addEventListener('click', close);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('click', close);
			document.removeEventListener('keydown', onKey);
		};
	}, [fabOpen]);

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

			{/* ── Mobile Speed Dial FAB ───────────────────── */}
			<div
				role='none'
				className='md:hidden fixed right-6 z-50 flex flex-col items-end gap-3'
				style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom) + 1rem)' }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Menu items */}
				<div
					className={cn(
						'flex flex-col items-end gap-3 transition-all duration-200',
						fabOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none',
					)}
				>
					<div className='flex items-center gap-2'>
						<span className='bg-foreground/90 text-background text-xs font-semibold px-3 py-1.5 rounded-xl shadow'>악보 추가</span>
						<button
							onClick={() => { setFabOpen(false); navigate('/scores/new'); }}
							className='w-12 h-12 rounded-full bg-card border shadow-lg flex items-center justify-center hover:bg-muted transition-colors'
						>
							<Music className='h-5 w-5' />
						</button>
					</div>
					<div className='flex items-center gap-2'>
						<span className='bg-foreground/90 text-background text-xs font-semibold px-3 py-1.5 rounded-xl shadow'>엑셀 업로드</span>
						<button
							onClick={() => { setFabOpen(false); setUploadOpen(true); }}
							className='w-12 h-12 rounded-full bg-card border shadow-lg flex items-center justify-center hover:bg-muted transition-colors'
						>
							<Sheet className='h-5 w-5' />
						</button>
					</div>
				</div>

				{/* Main FAB */}
				<button
					onClick={() => setFabOpen((o) => !o)}
					aria-label={fabOpen ? '메뉴 닫기' : '메뉴 열기'}
					aria-expanded={fabOpen}
					className={cn(
						'w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95',
						fabOpen ? 'bg-foreground text-background rotate-45' : 'bg-primary text-primary-foreground',
					)}
				>
					{fabOpen ? <X className='h-6 w-6' /> : <Plus className='h-6 w-6' />}
				</button>
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
