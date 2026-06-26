import { ChevronDown, ChevronsUpDown, ChevronUp, MailCheck } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { abbreviateInstrument } from '@/utils/instrument';

import { Commission } from '../types';

const Th = ({ children, className }: { children: ReactNode; className: string }) => {
  return (
    <th
      className={cn(
        'text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-3.5',
        className,
      )}
    >
      {children}
    </th>
  );
};

interface CommissionDesktopTableProps {
  paged: Commission[];
  filter: string;
  sortDir: 'asc' | 'desc' | null;
  onSortToggle: () => void;
  onNavigate: (id: string) => void;
  emptyNode: ReactNode;
}

export function CommissionDesktopTable({
  paged,
  filter,
  sortDir,
  onSortToggle,
  onNavigate,
  emptyNode,
}: CommissionDesktopTableProps) {
  const SortIcon =
    sortDir === 'asc' ? ChevronUp : sortDir === 'desc' ? ChevronDown : ChevronsUpDown;

  if (!paged.length) {
    return (
      <div className='hidden md:block bg-card rounded-3xl border shadow-sm overflow-hidden'>
        {emptyNode}
      </div>
    );
  }

  return (
    <div className='hidden md:block bg-card rounded-3xl border shadow-sm overflow-hidden'>
      <table
        className='w-full table-fixed'
        aria-label='의뢰 목록'
      >
        <thead>
          <tr className='border-b border-border/50'>
            <th
              className='text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-6 py-3.5 w-[11%] cursor-pointer select-none'
              onClick={onSortToggle}
              aria-sort={
                sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none'
              }
            >
              <span className='inline-flex items-center gap-1'>
                마감일
                <SortIcon className='h-3 w-3' />
              </span>
            </th>
            <Th className='text-left w-[26%]'>곡명</Th>
            <Th className='text-left w-[20%]'>작곡가</Th>
            <Th className='text-left w-[22%]'>편성</Th>
            {filter === 'complete' && (
              <Th className='text-center w-[11%]'>전달 여부</Th>
            )}
          </tr>
        </thead>
        <tbody className='divide-y divide-border/30'>
          {paged.map(item => (
            <tr
              key={item.id}
              role='button'
              tabIndex={0}
              className='cursor-pointer hover:bg-muted/20 transition-colors group'
              onClick={() => onNavigate(item.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate(item.id);
                }
              }}
            >
              <td className='px-6 py-4 text-sm text-muted-foreground tabular-nums'>
                {item.deadline}
              </td>
              <td className='px-3 py-4 text-sm font-semibold truncate group-hover:text-primary transition-colors'>
                {item.songs?.title ?? item.title ?? '-'}
              </td>
              <td className='px-3 py-4 text-sm text-muted-foreground truncate'>
                {item.songs?.composer ?? item.composer ?? '-'}
              </td>
              <td className='px-3 py-4 text-sm text-muted-foreground'>
                {(item.arrangement ?? '').split(', ').map(abbreviateInstrument).join(', ')}
              </td>
              {filter === 'complete' && (
                <td className='px-3 py-4 text-sm text-muted-foreground'>
                  {item.is_delivered ? <MailCheck className='h-4 w-4 mx-auto' /> : '-'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
