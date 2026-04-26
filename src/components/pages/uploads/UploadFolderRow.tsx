import { ExcelUpload } from '@/types/stats';
import { motion } from 'framer-motion';
import { ChevronRight, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

function UploadFolderRow(upload: ExcelUpload) {
	const navigate = useNavigate();

	return (
		<motion.div
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.15 }}
		>
			<div className='w-full flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-muted/40 transition-colors group cursor-pointer'>
				<button
					type='button'
					onClick={() => navigate(`/files/excel/${upload.id}`)}
					className='flex items-center gap-3 flex-1 min-w-0 text-left px-2 py-2'
				>
					<FileSpreadsheet className='h-4 w-4 text-primary/60 group-hover:text-primary shrink-0 transition-colors' />
					<span className='font-medium text-sm flex-1 truncate'>{upload.name}</span>
					<span className='hidden md:block text-xs text-muted-foreground tabular-nums shrink-0'>
						{dayjs(upload.uploaded_at).format('YYYY-MM-DD')}
					</span>
					<span className='text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full shrink-0 tabular-nums'>
						{upload.row_count.toLocaleString()}건
					</span>
					<ChevronRight className='h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors' />
				</button>
			</div>
		</motion.div>
	);
}

export default UploadFolderRow;
