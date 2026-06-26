import { ArrowDown,ArrowUp, ArrowUpDown } from 'lucide-react';

import { SortDir,SortKey } from '@/hooks/use-sales-table-data';

interface SortIconProps {
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}

function SortIcon({ col, sortKey, sortDir }: SortIconProps) {
  if (sortKey !== col) return <ArrowUpDown className='h-3 w-3 ml-1 opacity-40' />;
  return sortDir === 'asc' ? <ArrowUp className='h-3 w-3 ml-1' /> : <ArrowDown className='h-3 w-3 ml-1' />;
}

export default SortIcon;