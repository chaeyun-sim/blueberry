import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileSpreadsheet, Trash2, ScrollText } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { statsMutations } from '@/api/stats/mutations';
import { statsKeys } from '@/api/stats/queryKeys';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/utils/query-client';
import { formatCurrency } from '@/utils/format-currency';
import { splitProduct } from '@/utils/split-product';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import AppHeader from '@/components/layout/AppHeader';

export default function ExcelUploadDetail() {
	const { uploadId } = useParams<{ uploadId: string }>();
	const navigate = useNavigate();
	const { isGuest } = useAuth();
	const [summaryOpen, setSummaryOpen] = useState(false);

	const {
		data: uploads = [],
		isError: isUploadsError,
		error: uploadsError,
	} = useQuery(statsQueries.getExcelUploads());
	const {
		data: rows = [],
		isLoading,
		isError: isRowsError,
		error: rowsError,
	} = useQuery(statsQueries.getSalesRowsByUploadId(uploadId ?? ''));

	const upload = uploads.find((u) => u.id === uploadId);

	const { mutate: deleteUpload, isPending: isDeleting } = useMutation(
		statsMutations.deleteExcelUpload(),
	);

	const handleDelete = () => {
		if (isGuest) {
			toast.error('게스트 모드에서는 업로드를 삭제할 수 없습니다.');
			return;
		}
		if (!upload) return;
		if (
			!confirm(
				`"${upload.name}" 업로드를 삭제하시겠습니까?\n연결된 ${upload.row_count}건의 매출 데이터도 함께 삭제됩니다.`,
			)
		)
			return;

		deleteUpload(upload.id, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: statsKeys.all });
				toast.success(`"${upload.name}" 업로드가 삭제되었습니다.`);
				navigate('/files');
			},
			onError: (e) =>
				toast.error('삭제에 실패했습니다.', {
					description: e instanceof Error ? e.message : undefined,
				}),
		});
	};

	if (isUploadsError || isRowsError) {
		const message =
			(rowsError as Error)?.message ??
			(uploadsError as Error)?.message ??
			'데이터를 불러오지 못했습니다.';

		return (
			<AppLayout>
				<PageHeader title='업로드 상세' />
				<div className='mt-6 text-sm text-destructive'>{message}</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout>
			<AppHeader>
				<AppHeader.Back />
				{upload && (
					<AppHeader.Right>
						<Button
							variant='ghost'
							size='icon'
							className='text-muted-foreground hover:text-destructive hover:bg-destructive/10'
							onClick={handleDelete}
							disabled={isDeleting}
							aria-label='업로드 삭제'
						>
							<Trash2 className='h-4 w-4' />
						</Button>
					</AppHeader.Right>
				)}
			</AppHeader>

			<PageHeader title={upload?.name ?? '업로드 상세'} />
			{upload && (
				<div className='-mt-6 mb-8 flex items-center gap-1.5'>
					<p className='text-muted-foreground text-sm'>
						{upload.row_count.toLocaleString()}건
					</p>
					<button
						className='text-muted-foreground hover:text-foreground transition-colors'
						onClick={() => setSummaryOpen(true)}
						aria-label='곡별 매출 요약 보기'
					>
						<ScrollText className='h-3.5 w-3.5' />
					</button>
				</div>
			)}

			{isLoading ? (
				<div className='space-y-4 mt-6'>
					{[0, 1, 2, 3].map((i) => (
						<div key={i} className='h-12 rounded-lg bg-muted animate-pulse' />
					))}
				</div>
			) : rows.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
					<FileSpreadsheet className='h-12 w-12 mb-3 opacity-40' />
					<p className='text-sm'>데이터가 없습니다</p>
				</div>
			) : (
				<Card className='border-border/50 mt-6'>
					<CardContent className='p-2 md:p-5'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className='text-xs uppercase'>대분류</TableHead>
									<TableHead className='text-xs uppercase'>곡명</TableHead>
									<TableHead className='text-xs uppercase'>편성명</TableHead>
									<TableHead className='text-xs uppercase text-right'>
										상품총액
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((row) => {
									const { song, arrangement } = splitProduct(row.product);
									return (
										<TableRow key={row.id}>
											<TableCell>
												<span className='px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground'>
													{row.category}
												</span>
											</TableCell>
											<TableCell className='font-medium text-sm'>{song}</TableCell>
											<TableCell className='text-sm text-muted-foreground'>
												{arrangement}
											</TableCell>
											<TableCell className='text-right tabular-nums text-sm'>
												{formatCurrency(row.amount)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
			<SongSummaryDialog
				open={summaryOpen}
				onOpenChange={setSummaryOpen}
				rows={rows}
			/>
		</AppLayout>
	);
}

function SongSummaryDialog({
	open,
	onOpenChange,
	rows,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	rows: { product: string; amount: number }[];
}) {
	const summary = Object.entries(
		rows.reduce<Record<string, { arrangements: Set<string>; total: number }>>(
			(acc, row) => {
				const { song, arrangement } = splitProduct(row.product);
				if (!acc[song]) acc[song] = { arrangements: new Set(), total: 0 };
				acc[song].arrangements.add(arrangement);
				acc[song].total += row.amount;
				return acc;
			},
			{},
		),
	)
		.map(([song, { arrangements, total }]) => ({
			song,
			count: arrangements.size,
			total,
		}))
		.sort((a, b) => b.count - a.count || b.total - a.total);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-xl'>
				<DialogHeader>
					<DialogTitle>곡별 매출 요약</DialogTitle>
				</DialogHeader>
				<div className='max-h-[60vh] overflow-y-auto '>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='text-xs uppercase text-left'>곡명</TableHead>
								<TableHead className='text-xs uppercase text-center shrink-0 w-fit'>
									편성 수
								</TableHead>
								<TableHead className='text-xs uppercase text-right shrink-0'>
									총 매출
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{summary.map(({ song, count, total }) => (
								<TableRow key={song}>
									<TableCell className='font-medium text-sm text-left'>{song}</TableCell>
									<TableCell className='text-center text-sm text-muted-foreground shrink-0'>
										{count}
									</TableCell>
									<TableCell className='text-right tabular-nums text-sm shrink-0'>
										{formatCurrency(total)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</DialogContent>
		</Dialog>
	);
}
