import { useRef, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import Button from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { overlay } from 'overlay-kit';
import { commissionQueries } from '@/api/commission/queries';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import AppHeader from '@/components/layout/AppHeader';
import { useCommissionEditForm } from '@/hooks/use-commission-edit-form';
import { CancelCommissionDialog } from '@/components/pages/commission/CancelCommissionDialog';
import { InlineEditField } from '@/components/pages/commission/InlineEditField';
import { CommissionInfoCard } from '@/components/pages/commission/CommissionInfoCard';

const CommissionEdit = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const titleEditRef = useRef<HTMLInputElement>(null);
	const composerEditRef = useRef<HTMLInputElement>(null);

	const [isTitleEditing, setIsTitleEditing] = useState(false);
	const [isComposerEditing, setIsComposerEditing] = useState(false);

	const { data: commission, isLoading } = useQuery(commissionQueries.getCommission(id));

	const { form, setForm, isSubmitting, handleSave } = useCommissionEditForm(commission);

	const handleCancel = () => {
		overlay.open(
			({ isOpen, close }) => (
				<CancelCommissionDialog
					isOpen={isOpen}
					close={close}
					commissionId={id!}
					prevStatus={commission!.status}
				/>
			),
			{ overlayId: 'cancel-commission-dialog' },
		);
	};

	if (!id) return <Navigate to='/commissions' replace />;

	if (isLoading || !commission) return null;

	return (
		<AppLayout
			bottomBar={
				<div className='md:border-t md:border-border md:bg-background/95 md:backdrop-blur-sm'>
					<div className='px-4 py-2 md:px-6 md:py-3 flex items-center gap-3'>
						<Button
							variant='outline'
							className='flex-1 md:flex-none rounded-2xl md:rounded-md py-6 md:py-2'
							disabled={isSubmitting}
							onClick={() => navigate(-1)}
						>
							수정 취소
						</Button>
						<Button
							onClick={() => handleSave(id)}
							className='flex-1 md:flex-none md:px-6 rounded-2xl md:rounded-md py-6 md:py-2 shadow-lg md:shadow-none'
							disabled={isSubmitting}
						>
							{isSubmitting ? '수정 중...' : '수정 저장'}
						</Button>
					</div>
				</div>
			}
		>
			<AppHeader>
				<AppHeader.Back />
			</AppHeader>

			<div className='mb-6'>
				<InlineEditField
					value={form.title}
					isEditing={isTitleEditing}
					inputRef={titleEditRef}
					onChange={(v) => setForm((prev) => ({ ...prev, title: v }))}
					onStartEditing={() => {
						setIsTitleEditing(true);
						setTimeout(() => titleEditRef.current?.focus(), 0);
					}}
					onStopEditing={() => setIsTitleEditing(false)}
					placeholder='곡명을 입력하세요'
					ariaLabel='곡명 편집'
					inputClassName='text-2xl font-display font-bold w-full bg-transparent border-b-2 border-primary outline-none pb-0.5 tracking-tight'
					buttonClassName='group flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity text-left border-b-2 border-transparent pb-0.5'
					displayContent={
						<h1 className='text-2xl font-display font-bold tracking-tight'>{form.title}</h1>
					}
					emptyDisplay={
						<h1 className='text-2xl font-display font-bold tracking-tight'>
							<span className='text-muted-foreground font-normal text-xl'>곡명 없음</span>
						</h1>
					}
				/>

				<InlineEditField
					value={form.composer}
					isEditing={isComposerEditing}
					inputRef={composerEditRef}
					onChange={(v) => setForm((prev) => ({ ...prev, composer: v }))}
					onStartEditing={() => {
						setIsComposerEditing(true);
						setTimeout(() => composerEditRef.current?.focus(), 0);
					}}
					onStopEditing={() => setIsComposerEditing(false)}
					placeholder='작곡가를 입력하세요'
					ariaLabel='작곡가 편집'
					inputClassName='mt-1 text-sm text-muted-foreground w-full bg-transparent border-b border-primary outline-none pb-0.5'
					buttonClassName='group flex items-center gap-1.5 mt-1 cursor-pointer hover:opacity-70 transition-opacity text-left border-b border-transparent pb-0.5'
					displayContent={<p className='text-sm text-muted-foreground'>{form.composer}</p>}
					emptyDisplay={
						<p className='text-sm text-muted-foreground'>
							<span className='italic'>작곡가 미입력</span>
						</p>
					}
				/>
			</div>

			<CommissionInfoCard
				form={form}
				isSubmitting={isSubmitting}
				onChange={(update) => setForm((prev) => ({ ...prev, ...update }))}
			/>

			{commission.status !== 'cancelled' && (
				<div className='border-t border-border/50 pt-6'>
					<div className='flex items-center justify-between gap-4'>
						<div>
							<p className='text-sm font-medium text-muted-foreground'>의뢰 취소</p>
							<p className='text-xs text-muted-foreground/70 mt-0.5'>
								취소 후에도 기록은 유지되며 '취소' 탭에서 확인할 수 있습니다.
							</p>
						</div>
						<button
							type='button'
							onClick={handleCancel}
							className='shrink-0 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors cursor-pointer min-h-[44px] px-1'
						>
							<XCircle className='h-4 w-4' />
							취소 처리
						</button>
					</div>
				</div>
			)}
		</AppLayout>
	);
};

export default CommissionEdit;
