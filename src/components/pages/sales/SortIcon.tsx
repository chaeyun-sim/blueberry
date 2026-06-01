import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortKey, SortDir } from '@/hooks/use-sales-table-data';

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <ArrowUpDown className='h-3 w-3 ml-1 opacity-40' />;
  return sortDir === 'asc' ? <ArrowUp className='h-3 w-3 ml-1' /> : <ArrowDown className='h-3 w-3 ml-1' />;
}

export default SortIcon;