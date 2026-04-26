import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Upload, Sheet, AlertCircle } from 'lucide-react';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import UploadFolderRow from './UploadFolderRow';

function ExcelTab({ onUploadRequest }: { onUploadRequest: () => void }) {
	const {
		data: uploads = [],
		isLoading,
		isError,
		refetch,
	} = useQuery(statsQueries.getExcelUploads());

	if (isLoading && !uploads.length) {
		return (
			<div className='space-y-4'>
				{[0, 1, 2].map((i) => (
					<div key={i} className='h-12 rounded-lg bg-muted animate-pulse' />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<Card className='border-destructive/50'>
				<CardContent className='p-6'>
					<div className='flex items-center gap-4'>
						<AlertCircle className='h-8 w-8 text-destructive flex-shrink-0' />
						<div className='flex-1'>
							<p className='font-medium text-destructive'>
								업로드 목록을 불러올 수 없습니다
							</p>
							<p className='text-sm text-muted-foreground mt-1'>
								잠시 후 다시 시도해주세요.
							</p>
						</div>
						<Button onClick={() => refetch()}>다시 시도</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className='border-border/50'>
			<CardContent className='p-2 md:p-5'>
				<div className='flex flex-col gap-0.5'>
					{uploads.map((upload) => (
						<UploadFolderRow key={upload.id} {...upload} />
					))}
				</div>

				{uploads.length === 0 && (
					<div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
						<Sheet className='h-10 w-10 mb-3 opacity-30' />
						<p className='text-sm font-medium'>아직 업로드된 엑셀 파일이 없습니다</p>
						<Button
							variant='outline'
							className='mt-4 gap-2'
							onClick={onUploadRequest}
						>
							<Upload className='h-4 w-4' />첫 번째 업로드
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default ExcelTab;
