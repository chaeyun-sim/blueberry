import { useNavigate } from 'react-router-dom';

import dayjs from 'dayjs';
import { FileMusic } from 'lucide-react';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { Arrangement } from '../types';

interface ScoreArrangementTableProps {
	songId: string;
	arrangements: Arrangement[];
}

export function ScoreArrangementTable({ songId, arrangements }: ScoreArrangementTableProps) {
	const navigate = useNavigate();

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className='text-xs uppercase tracking-wider text-left'>편성명</TableHead>
					<TableHead className='text-xs uppercase tracking-wider text-right'>등록일</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{arrangements.map((arr) => (
					<TableRow
						key={arr.id}
						role='button'
						tabIndex={0}
						className='cursor-pointer hover:bg-muted/50'
						onClick={() => navigate(`/scores/${songId}/arrangements/${arr.id}`)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								navigate(`/scores/${songId}/arrangements/${arr.id}`);
							}
						}}
					>
						<TableCell className='font-medium flex items-center gap-2'>
							<FileMusic className='h-4 w-4 text-muted-foreground/60 shrink-0' />
							{arr.arrangement.split(',').length >= 10 ? 'Orchestra' : arr.arrangement}
						</TableCell>
						<TableCell className='text-right text-muted-foreground'>
							{dayjs(arr.created_at).format('YYYY-MM-DD')}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
