import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, Music, Pencil, Plus, Sheet, Tag, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { statsMutations } from '@/api/stats/mutations';
import { statsKeys } from '@/api/stats/queryKeys';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ExcelUploadDialog } from '@/components/ExcelUploadDialog';
import { AppLayout } from '@/components/layout/AppLayout';
import ScoreTab from '@/components/pages/scores/ScoreTab';
import ExcelTab from '@/components/pages/uploads/ExcelTab';
import { Input } from '@/components/ui/input';
import { commissionKeys, commissionMutations, commissionQueries } from '@/features/commission/api';
import { cn } from '@/lib/utils';
import { ExcelRow } from '@/types/excel';
import { queryClient } from '@/utils/query-client';

const tabs = [
	{ key: 'scores',     icon: Music, label: '악보 관리' },
	{ key: 'excel',      icon: Sheet, label: '엑셀 관리' },
	{ key: 'categories', icon: Tag,   label: '카테고리 관리' },
];

function CategoryTab() {
	const { data: categories = [] } = useQuery(commissionQueries.getCategories());
	const [newCatName, setNewCatName] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingName, setEditingName] = useState('');

	const invalidate = () => queryClient.invalidateQueries({ queryKey: commissionKeys.categories() });

	const { mutate: createCategory, isPending: isCreating } = useMutation({
		...commissionMutations.createCategory(),
		onSuccess: () => { setNewCatName(''); invalidate(); },
		onError: (e) => toast.error('카테고리 추가에 실패했어요', { description: e.message }),
	});

	const { mutate: updateCategory, isPending: isUpdating } = useMutation({
		...commissionMutations.updateCategory(),
		onSuccess: () => { setEditingId(null); invalidate(); },
		onError: (e) => toast.error('카테고리 수정에 실패했어요', { description: e.message }),
	});

	const { mutate: deleteCategory } = useMutation({
		...commissionMutations.deleteCategory(),
		onSuccess: invalidate,
		onError: (e) => toast.error('카테고리 삭제에 실패했어요', { description: e.message }),
	});

	return (
		<div className='max-w-sm'>
			<p className='text-sm text-muted-foreground mb-4'>
				의뢰에 붙일 카테고리를 관리해요. 의뢰 플랫폼, 중요도 등 자유롭게 사용하세요.
			</p>

			<div className='space-y-2'>
				{categories.length === 0 && (
					<div className='text-sm text-muted-foreground py-4 text-center'>
						아직 카테고리가 없어요.
					</div>
				)}

				{categories.map((cat) => (
					<div key={cat.id} className='flex items-center gap-2 px-3 py-2 rounded-xl bg-card border'>
						{editingId === cat.id ? (
							<>
								<Input
									value={editingName}
									onChange={(e) => setEditingName(e.target.value)}
									className='h-7 text-sm flex-1 border-0 p-0 focus-visible:ring-0 bg-transparent'
									onKeyDown={(e) => {
										if (e.key === 'Enter') updateCategory({ id: cat.id, name: editingName });
										if (e.key === 'Escape') setEditingId(null);
									}}
									ref={(el) => { el?.focus(); }}
								/>
								<button
									type='button'
									onClick={() => updateCategory({ id: cat.id, name: editingName })}
									disabled={isUpdating || !editingName.trim()}
									className='p-1 rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-40'
									aria-label='저장'
								>
									<Check className='w-3.5 h-3.5' />
								</button>
								<button
									type='button'
									onClick={() => setEditingId(null)}
									className='p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors'
									aria-label='취소'
								>
									<X className='w-3.5 h-3.5' />
								</button>
							</>
						) : (
							<>
								<span className='text-sm flex-1 truncate'>{cat.name}</span>
								<button
									type='button'
									onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
									className='p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors'
									aria-label='편집'
								>
									<Pencil className='w-3.5 h-3.5' />
								</button>
								<button
									type='button'
									onClick={() => deleteCategory({ id: cat.id })}
									className='p-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors'
									aria-label='삭제'
								>
									<Trash2 className='w-3.5 h-3.5' />
								</button>
							</>
						)}
					</div>
				))}

				<div className='flex items-center gap-2 pt-2'>
					<Input
						value={newCatName}
						onChange={(e) => setNewCatName(e.target.value)}
						placeholder='새 카테고리 이름...'
						className='h-9 text-sm flex-1'
						onKeyDown={(e) => {
							if (e.key === 'Enter' && newCatName.trim()) {
								createCategory({ name: newCatName.trim() });
							}
						}}
					/>
					<button
						type='button'
						onClick={() => { if (newCatName.trim()) createCategory({ name: newCatName.trim() }); }}
						disabled={isCreating || !newCatName.trim()}
						className='flex items-center gap-1.5 px-3 h-9 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-40'
					>
						<Plus className='w-3.5 h-3.5' />
						추가
					</button>
				</div>
			</div>
		</div>
	);
}

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

	const activeLabel = tabs.find((t) => t.key === activeTab)?.label ?? '관리';

	return (
		<AppLayout>
			{/* ── Header ─────────────────────────────────── */}
			<div className='flex items-center justify-between mb-6'>
				<div>
					<p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
						관리
					</p>
					<h1 className='text-3xl font-display font-bold tracking-tight mt-0.5'>
						{activeLabel}
					</h1>
				</div>

				<div className='hidden md:block'>
					{activeTab === 'scores' && (
						<button
							onClick={() => navigate('/scores/new')}
							className='flex items-center gap-1.5 bg-foreground text-background text-xs font-semibold px-5 py-2 rounded-2xl hover:opacity-80 transition-opacity'
						>
							<Plus className='h-3.5 w-3.5' />
							악보 추가
						</button>
					)}
					{activeTab === 'excel' && (
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
			{activeTab === 'categories' && <CategoryTab />}

			{/* ── Mobile Speed Dial FAB ───────────────────── */}
			{activeTab !== 'categories' && (
				<div
					role='none'
					className='md:hidden fixed right-6 z-50 flex flex-col items-end gap-3'
					style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom) + 1rem)' }}
					onClick={(e) => e.stopPropagation()}
				>
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
			)}
		</AppLayout>
	);
};

const Files = () => (
	<ErrorBoundary level='page'>
		<FilesContent />
	</ErrorBoundary>
);

export default Files;
