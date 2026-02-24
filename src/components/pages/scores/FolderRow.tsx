import { Song } from '@/types/score';
import { motion } from 'framer-motion';
import { Folder, Layers } from 'lucide-react';

function FolderRow({ song, onClick }: { song: Song; onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors group"
      >
        <Folder className="h-5 w-5 text-primary/70 group-hover:text-primary shrink-0 transition-colors" />
        <span className="font-medium text-sm flex-1 truncate">{song.title}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Layers className="h-3 w-3" />
          {song.arrangements.length}
        </span>
      </button>
    </motion.div>
  );
}

export default FolderRow;