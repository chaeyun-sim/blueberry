import { WEEK_KOR } from '@/constants/week';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockDeadlineDays = [21, 23, 25];

function MiniCalendar() {
  const navigate = useNavigate();

  const [viewDate, setViewDate] = useState(dayjs());
  const today = dayjs();

  const year = viewDate.year();
  const month = viewDate.month();

  const { startDay, daysInMonth } = useMemo(() => {
    const first = viewDate.startOf('month');
    return {
      startDay: first.day(),
      daysInMonth: viewDate.daysInMonth(),
    };
  }, [viewDate]);

  const cells = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length < 42) arr.push(null);
    return arr;
  }, [startDay, daysInMonth]);

  const isToday = (d: number) => viewDate.date(d).isSame(today, 'day');
  const hasDeadline = (d: number) =>
    viewDate.isSame(today, 'month') && mockDeadlineDays.includes(d);

  const handleChangeMonth = (type: 'add' | 'sub') => {
    const value = type === 'add' ? viewDate.add(1, 'month') : viewDate.subtract(1, 'month');
    setViewDate(value);
  }

  return (
    <div
      className='flex flex-col h-full cursor-pointer'
      tabIndex={0}
      role='button'
      onKeyDown={e => {
        if (e.currentTarget !== e.target) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/calendar')
        }
      }}
      onClick={() => navigate('/calendar')}
    >
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-display font-semibold text-sm'>
          {year}년 {month + 1}월
        </h3>
        <div
          className='flex gap-1'
          onClick={e => e.stopPropagation()}
        >
          <button
            className='p-1 rounded hover:bg-muted/50 transition-colors'
            onClick={() => handleChangeMonth('sub')}
          >
            <ChevronLeft className='h-3.5 w-3.5 text-muted-foreground' />
          </button>
          <button
            className='p-1 rounded hover:bg-muted/50 transition-colors'
            onClick={() => handleChangeMonth('add')}
          >
            <ChevronRight className='h-3.5 w-3.5 text-muted-foreground' />
          </button>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-y-1 text-center text-[10px] text-muted-foreground mb-1'>
        {WEEK_KOR.map(weekDay => (
          <span
            key={weekDay}
            className='font-medium'
          >
            {weekDay}
          </span>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-y-0.5 text-center flex-1'>
        {cells.map((d, i) => (
          <div
            key={i}
            className='flex flex-col items-center justify-center'
          >
            {d ? (
              <span
                className={`
                  w-7 h-7 flex items-center justify-center text-xs font-medium transition-colors
                  ${isToday(d) ? 'rounded-full bg-primary text-primary-foreground font-bold' : ''}
                `}
              >
                {hasDeadline(d) && !isToday(d) ? (
                  <span className='px-1 bg-yellow-300/30 rounded-[2px]'>{d}</span>
                ) : (
                  d
                )}
              </span>
            ) : (
              <span className='w-7 h-7' />
            )}
          </div>
        ))}
      </div>

      <div className='flex items-center gap-3 mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <span className='w-2 h-2 rounded-full bg-primary' /> 오늘
        </span>
        <span className='flex items-center gap-1'>
          <span className='w-2 h-2 rounded-sm bg-yellow-300/40' /> 마감
        </span>
      </div>
    </div>
  );
}

export default MiniCalendar;
