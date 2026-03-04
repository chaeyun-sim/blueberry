import { Song } from '@/types/score';
import { motion } from 'framer-motion';
import { Folder, FolderOpen, Layers, Trash2 } from 'lucide-react';
import Button from '@/components/ui/button';

function FolderRow({ song, onClick, onDelete }: { song: Song; onClick: () => void; onDelete: () => void }) {
  const Icon = song.arrangements.length > 0 ? FolderOpen : Folder;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <div className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted/30 transition-colors group">
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-4 flex-1 min-w-0 text-left"
        >
          <Icon className="h-5 w-5 text-primary/70 group-hover:text-primary shrink-0 transition-colors" />
          <span className="font-medium text-sm flex-1 truncate">{song.title}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {song.arrangements.length}
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
          aria-label="악보 삭제"
          onClick={e => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

export default FolderRow;