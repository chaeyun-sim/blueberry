import { ExcelUpload } from '@/types/stats';
import { motion } from 'framer-motion';
import { FileSpreadsheet } from 'lucide-react';

interface UploadFolderRowProps {
  upload: ExcelUpload;
  onClick: () => void;
}

function UploadFolderRow({
  upload,
  onClick,
}: UploadFolderRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <div className='w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted/30 transition-colors group'>
        <button
          type='button'
          onClick={onClick}
          className='flex items-center gap-4 flex-1 min-w-0 text-left cursor-pointer'
        >
          <FileSpreadsheet className='h-5 w-5 text-primary/70 group-hover:text-primary shrink-0 transition-colors' />
          <span className='font-medium text-sm flex-1 truncate'>{upload.name}</span>
          <span className='text-xs text-muted-foreground tabular-nums'>
            {upload.row_count.toLocaleString()}건
          </span>
        </button>
      </div>
    </motion.div>
  );
}

export default UploadFolderRow;