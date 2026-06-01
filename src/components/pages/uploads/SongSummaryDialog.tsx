import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/utils/format-currency';
import { splitProduct } from '@/utils/split-product';

interface SongSummaryDialogProps {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	rows: { product: string; amount: number }[];
}

function buildSongSummary(rows: { product: string; amount: number }[]) {
	return Object.entries(
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
		.map(([song, { arrangements, total }]) => ({ song, count: arrangements.size, total }))
		.sort((a, b) => b.count - a.count || b.total - a.total);
}

export function SongSummaryDialog({ open, onOpenChange, rows }: SongSummaryDialogProps) {
	const summary = buildSongSummary(rows);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-xl'>
				<DialogHeader>
					<DialogTitle>곡별 매출 요약</DialogTitle>
				</DialogHeader>
				<div className='max-h-[60vh] overflow-y-auto'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='text-xs uppercase text-left'>곡명</TableHead>
								<TableHead className='text-xs uppercase text-center shrink-0 w-fit'>편성 수</TableHead>
								<TableHead className='text-xs uppercase text-right shrink-0'>총 매출</TableHead>
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
