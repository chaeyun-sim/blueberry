import { motion } from 'framer-motion';
import { ChevronRight, Folder, FolderOpen, Trash2 } from 'lucide-react';
import Button from '@/components/ui/button';

interface FolderRowProps {
	label: string;
	count: number;
	onClick: () => void;
	onDelete?: () => void;
}

function FolderRow({ label, count, onClick, onDelete }: FolderRowProps) {
	const Icon = count > 0 ? FolderOpen : Folder;

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
					onClick={onClick}
					className='flex items-center gap-3 flex-1 min-w-0 text-left px-2 py-2'
				>
					<Icon className='h-4 w-4 text-primary/60 group-hover:text-primary shrink-0 transition-colors' />
					<span className='font-medium text-sm flex-1 truncate'>{label}</span>
					<span className='text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full shrink-0 tabular-nums'>
						{count}
					</span>
					<ChevronRight className='h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors' />
				</button>
				{onDelete && (
					<Button
						variant='ghost'
						size='icon'
						className='h-7 w-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'
						aria-label='악보 삭제'
						onClick={(e) => {
							e.stopPropagation();
							onDelete();
						}}
					>
						<Trash2 className='h-3.5 w-3.5' />
					</Button>
				)}
			</div>
		</motion.div>
	);
}

export default FolderRow;
