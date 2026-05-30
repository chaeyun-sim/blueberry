import dayjs from 'dayjs';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import {
	ChevronRight,
	ExternalLink,
	Mail,
	MoreVertical,
	Pencil,
	Trash2,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { overlay } from 'overlay-kit';
import ReceiveAndSendDialog from '@/components/pages/commission/ReceiveAndSendDialog';
import { CompleteDialog } from '@/components/pages/commission/CompleteDialog';
import SendEmailDialog from '@/components/pages/commission/SendEmailDialog';
import CommissionImageDialog from '@/components/pages/commission/CommissionImageDialog';
import { CommissionStatus } from '@/constants/status-config';
import { useMutation } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { commissionQueries } from '@/api/commission/queries';
import { commissionMutations } from '@/api/commission/mutations';
import { commissionKeys } from '@/api/commission/queryKeys';
import { scoreQueries } from '@/api/score/queries';
import DeleteCommissionDialog from '@/components/pages/commission/DeleteCommissionDialog';
import NotFound from './NotFound';
import { queryClient } from '@/utils/query-client';
import { COMMISSION_INFO } from '@/types/commission';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import AppHeader from '@/components/layout/AppHeader';
import { CommissionDetailSkeleton } from '@/components/pages/commission/CommissionDetailSkeleton';
import { CommissionStatusProgress } from '@/components/pages/commission/CommissionStatusProgress';
import { cleanTitle } from '@/utils/commission-utils';
import { COMMISSION_STATUS_TRANSLATE } from '@/constants/translate';

const toastMessages: Partial<Record<CommissionStatus, string>> = {
	working: '작업을 시작합니다.',
	complete: '작업이 완료되었습니다.',
};

const CommissionDetailContent = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { isGuest } = useAuth();

	const { data: commission, isLoading } = useQuery(
		commissionQueries.getCommission(id),
	);
	const { data: song } = useQuery(
		scoreQueries.getSong(commission?.song_id ?? ''),
	);
	const { mutate: updateStatus } = useMutation(
		commissionMutations.updateCommissionStatus(),
	);
	const { mutate: updateCommission } = useMutation(
		commissionMutations.updateCommission(),
	);

	const markDelivered = () => {
		if (!id) return;
		updateCommission(
			{ commissionId: id, input: { is_delivered: true } },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: commissionKeys.detail(id) });
					queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
				},
			},
		);
	};

	const rawTitle =
		song?.english_title ?? commission?.songs?.title ?? commission?.title ?? '';
	const imslpQuery = [
		cleanTitle(rawTitle),
		commission?.songs?.composer ?? commission?.composer,
	]
		.filter(Boolean)
		.join(' ');
	const imslpUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:imslp.org ${imslpQuery}`)}`;

	const commissionStatuses = Object.keys(COMMISSION_STATUS_TRANSLATE);
	const currentStatusIndex = commissionStatuses.findIndex(
		(status) => status === commission?.status,
	);

	const nextStatus =
		commission?.status === 'cancelled' || currentStatusIndex < 0
			? null
			: currentStatusIndex < commissionStatuses.length - 1
				? commissionStatuses[currentStatusIndex + 1]
				: null;

	const handleTransitionConfirm = () => {
		if (!nextStatus) return;
		updateStatus(
			{
				commissionId: id,
				status: nextStatus as CommissionStatus,
				prevStatus: commission.status,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: commissionKeys.detail(id) });
					queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
					toast.success(
						toastMessages[nextStatus as CommissionStatus] ?? '상태가 변경되었습니다.',
					);
				},
				onError: (e) => {
					toast.error('상태 변경에 실패했습니다.', { description: e.message });
				},
			},
		);
	};

	const openEmailDialog = () => {
		overlay.open(
			(overlayProps) => (
				<SendEmailDialog
					{...overlayProps}
					commissionId={id}
					onDelivered={markDelivered}
				/>
			),
			{ overlayId: 'send-email-dialog' },
		);
	};

	const handleOpenDialog = () => {
		if (nextStatus === 'working') {
			overlay.open((overlayProps) => (
				<ReceiveAndSendDialog
					{...overlayProps}
					commissionId={id}
					toStatus='working'
					onConfirm={handleTransitionConfirm}
				/>
			));
		} else {
			overlay.open((overlayProps) => (
				<CompleteDialog
					{...overlayProps}
					commission={commission}
					onConfirm={() => {
						handleTransitionConfirm();
						openEmailDialog();
					}}
				/>
			));
		}
	};

	const handleViewOriginalImage = () => {
		overlay.open(
			(overlayProps) => (
				<CommissionImageDialog
					{...overlayProps}
					date={commission?.created_at}
					imageUrl={commission?.image_url}
				/>
			),
			{ overlayId: 'original-image-dialog' },
		);
	};

	const handleDelete = () => {
		if (isGuest) {
			toast.error('게스트 모드에서는 의뢰를 삭제할 수 없습니다.');
			return;
		}

		overlay.open(
			(overlayProps) => (
				<DeleteCommissionDialog {...overlayProps} commissionId={id} />
			),
			{ overlayId: 'delete-commission-dialog' },
		);
	};

	if (!id) return <Navigate to='/commissions' replace />;

	if (isLoading) return <CommissionDetailSkeleton />;

	if (!commission) return <NotFound />;

	return (
		<AppLayout
			bottomBar={
				<div className='md:border-t md:border-border md:bg-background/95 md:backdrop-blur-sm'>
					<div className='px-4 py-2 md:px-6 md:py-3 flex items-center justify-end'>
						{commission.status !== 'cancelled' &&
							(nextStatus ? (
								<Button
									onClick={handleOpenDialog}
									className='gap-2 w-full md:w-auto rounded-2xl md:rounded-md py-6 md:py-5 shadow-lg md:shadow-none'
								>
									<ChevronRight className='h-4 w-4' />{' '}
									{COMMISSION_STATUS_TRANSLATE[nextStatus]}
									{nextStatus === 'working' ? '으로' : '로'} 변경
								</Button>
							) : !commission.is_delivered ? (
								<Button
									className='gap-2 w-full md:w-auto rounded-2xl md:rounded-md py-6 md:py-5 shadow-lg md:shadow-none'
									onClick={openEmailDialog}
								>
									<Mail className='h-4 w-4' /> 이메일 보내기
								</Button>
							) : null)}
					</div>
				</div>
			}
		>
			<AppHeader>
				<AppHeader.Back />
				<AppHeader.Right>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='hover:bg-foreground/5'
								aria-label='더보기 메뉴'
							>
								<MoreVertical className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align='end'
							className='mr-3 p-1.5 shadow-none min-w-fit'
						>
							<DropdownMenuItem
								onClick={() => navigate(`/commissions/${id}/edit`)}
								className='gap-2.5 cursor-pointer px-3 py-1 rounded-lg focus:bg-muted'
							>
								<Pencil className='h-4 w-4 text-muted-foreground shrink-0' />
								<span>수정</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator className='my-1.5' />
							<DropdownMenuItem
								onClick={handleDelete}
								className='gap-2.5 cursor-pointer px-3 py-1 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive'
							>
								<Trash2 className='h-4 w-4 shrink-0' />
								<span>삭제</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</AppHeader.Right>
			</AppHeader>

			<PageHeader
				title={song?.title ?? commission.songs?.title ?? commission.title ?? ''}
			/>

			{/* Status Progress */}
			<CommissionStatusProgress
				status={commission.status}
				currentStatusIndex={currentStatusIndex}
			/>

			<div className='mb-6'>
				{/* Commission Info */}
				<Card className='border-border/50'>
					<CardContent className='p-5'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='font-display font-semibold'>의뢰 정보</h2>
							<button
								className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors'
								onClick={handleViewOriginalImage}
							>
								원본 이미지 보기 <ExternalLink className='h-3 w-3' />
							</button>
						</div>
						<dl className='space-y-3'>
							{Object.keys(COMMISSION_INFO).map((key) => {
								const value = () => {
									if (key === 'version') {
										return commission.version ? `${commission.version} ver.` : '-';
									}
									if (key === 'created_at') {
										return commission.created_at
											? dayjs(commission.created_at).format('YYYY-MM-DD HH:mm')
											: '-';
									}
									if (key === 'composer') {
										return commission.songs?.composer ?? commission.composer ?? '-';
									}
									return commission[key] ?? '-';
								};
								return (
									<div
										key={key}
										className='flex items-center justify-between py-2 border-b border-border/50 last:border-0 gap-10 md:gap-0'
									>
										<dt className='text-sm text-muted-foreground shrink-0'>
											{COMMISSION_INFO[key]}
										</dt>
										<dd className='text-sm font-medium truncate'>{value()}</dd>
									</div>
								);
							})}
						</dl>
						{commission.notes && (
							<div className='mt-4 p-3 rounded-lg bg-muted/50'>
								<p className='text-sm text-muted-foreground'>{commission.notes}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Linked Scores */}
			<Card className='border-border/50'>
				<CardContent className='p-5'>
					<a
						href={imslpUrl}
						target='_blank'
						rel='noopener noreferrer'
						className='flex items-center justify-between w-full rounded-md hover:bg-muted/50 transition-colors'
					>
						<p className='text-sm font-medium'>IMSLP에서 찾기</p>
						<ExternalLink className='h-4 w-4 text-muted-foreground shrink-0' />
					</a>
				</CardContent>
			</Card>
		</AppLayout>
	);
};

const CommissionDetail = () => {
	const { id } = useParams();
	return (
		<ErrorBoundary key={id} level='page'>
			<CommissionDetailContent />
		</ErrorBoundary>
	);
};

export default CommissionDetail;
