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
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { commissionQueries } from '@/api/commission/queries';
import { scoreQueries } from '@/api/score/queries';
import NotFound from './NotFound';
import { COMMISSION_INFO } from '@/types/commission';
import AppHeader from '@/components/layout/AppHeader';
import { CommissionDetailSkeleton } from '@/components/pages/commission/CommissionDetailSkeleton';
import { CommissionStatusProgress } from '@/components/pages/commission/CommissionStatusProgress';
import { COMMISSION_STATUS_TRANSLATE } from '@/constants/translate';
import { useCommissionDetailActions } from '@/hooks/use-commission-detail-actions';

const CommissionDetailContent = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const { data: commission, isLoading } = useQuery(commissionQueries.getCommission(id));
	const { data: song } = useQuery(scoreQueries.getSong(commission?.song_id ?? ''));

	const {
		imslpUrl,
		currentStatusIndex,
		nextStatus,
		handleOpenDialog,
		openEmailDialog,
		handleViewOriginalImage,
		handleDelete,
	} = useCommissionDetailActions(id!, commission, song);

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
						<DropdownMenuContent align='end' className='mr-3 p-1.5 shadow-none min-w-fit'>
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

			<PageHeader title={song?.title ?? commission.songs?.title ?? commission.title ?? ''} />

			<CommissionStatusProgress
				status={commission.status}
				currentStatusIndex={currentStatusIndex}
			/>

			<div className='mb-6'>
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
									if (key === 'version') return commission.version ? `${commission.version} ver.` : '-';
									if (key === 'created_at') return commission.created_at ? dayjs(commission.created_at).format('YYYY-MM-DD HH:mm') : '-';
									if (key === 'composer') return commission.songs?.composer ?? commission.composer ?? '-';
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
