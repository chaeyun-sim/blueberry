import { Plus } from 'lucide-react';
import { DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CommissionForCalendar,getChipStyle, isCalendarToday } from '@/utils/calendar';

interface CalendarDayCellProps {
  day: number;
  currentMonth: boolean;
  dateStr: string;
  dayIdx: number;
  dayCommissions: CommissionForCalendar[];
  selectedDate: string | null;
  dragOverDate: string | null;
  draggingId: string | null;
  onSelect: (dateStr: string) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>, dateStr: string) => void;
  onDrop: (e: DragEvent<HTMLDivElement>, dateStr: string) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: DragEvent<HTMLButtonElement>, id: string) => void;
  onDragEnd: () => void;
  year: number;
  month: number;
}

export function CalendarDayCell({
  day,
  currentMonth,
  dateStr,
  dayIdx,
  dayCommissions,
  selectedDate,
  dragOverDate,
  draggingId,
  onSelect,
  onDragOver,
  onDrop,
  onDragLeave,
  onDragStart,
  onDragEnd,
  year,
  month,
}: CalendarDayCellProps) {
  const navigate = useNavigate();
  const isSun = dayIdx === 0;
  const isSat = dayIdx === 6;
  const isSelected = currentMonth && selectedDate === dateStr;
  const isDragTarget = currentMonth && dragOverDate === dateStr;

  return (
    <div
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (currentMonth) onSelect(dateStr);
        }
      }}
      className={cn(
        'group relative flex flex-col px-1.5 pt-1.5 overflow-hidden border-r border-border/30 last:border-r-0 h-full transition-colors',
        !currentMonth && 'bg-muted/10',
        currentMonth && 'cursor-pointer hover:bg-muted/20',
        isSelected && 'bg-primary/5 ring-1 ring-inset ring-primary/20',
        isDragTarget && '!bg-primary/10 ring-1 ring-inset ring-primary/30',
      )}
      onClick={() => {
        if (currentMonth) onSelect(dateStr);
      }}
      onDragOver={currentMonth ? e => onDragOver(e, dateStr) : undefined}
      onDragLeave={onDragLeave}
      onDrop={currentMonth ? e => onDrop(e, dateStr) : undefined}
    >
      {/* 날짜 + + 버튼 */}
      <div className='flex items-center justify-between mb-1 shrink-0'>
        <span
          className={cn(
            'inline-flex items-center justify-center w-6 h-6 text-[11px] rounded-full font-medium',
            !currentMonth && 'text-muted-foreground/20',
            currentMonth && isSun && 'text-destructive',
            currentMonth && isSat && 'text-warning',
            currentMonth && !isSun && !isSat && 'text-foreground',
            isCalendarToday(year, month, day) &&
              currentMonth &&
              'bg-foreground text-background font-bold ring-2 ring-foreground/20 ring-offset-1 ring-offset-background',
          )}
        >
          {day}
        </span>
        {currentMonth && (
          <button
            type='button'
            onClick={e => {
              e.stopPropagation();
              navigate(`/new?deadline=${dateStr}`);
            }}
            className='opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40'
            aria-label='의뢰 등록'
          >
            <Plus className='h-3 w-3' />
          </button>
        )}
      </div>

      {/* 의뢰 칩 */}
      <div className='flex flex-col gap-0.5 overflow-hidden flex-1 min-h-0'>
        {dayCommissions.slice(0, 2).map(c => {
          const title = c.songs?.title ?? c.title;

          return (
            <button
              type='button'
              key={c.id}
              draggable
              onDragStart={e => onDragStart(e, c.id)}
              onDragEnd={onDragEnd}
              className={cn(
                'w-full text-[10px] leading-none px-1.5 py-[3px] rounded-lg truncate font-medium transition-opacity hover:opacity-70 text-left shrink-0',
                (c.status === 'complete' || c.status === 'cancelled')
                  ? 'cursor-not-allowed'
                  : 'cursor-grab active:cursor-grabbing',
                getChipStyle(c.deadline, c.status),
                draggingId === c.id && 'opacity-30',
              )}
              title={`${title} — ${c.arrangement}`}
            >
              {title}
            </button>
          );
        })}
        {dayCommissions.length > 2 && (
          <span className='text-[10px] text-muted-foreground/60 pl-1 shrink-0'>
            +{dayCommissions.length - 2}
          </span>
        )}
      </div>
    </div>
  );
}
