import dayjs from 'dayjs';
import { AnimatePresence,motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CalendarDayCell } from '@/components/pages/calendar/CalendarDayCell';
import { SelectedDatePanel } from '@/components/pages/calendar/SelectedDatePanel';
import { WEEK_KOR } from '@/constants/week';
import { commissionQueries } from '@/features/commission/api';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { useCalendarDragDrop } from '@/hooks/use-calendar-drag-drop';
import { cn } from '@/lib/utils';
import { buildCalendarCells, buildCalendarDateStr, getCommissionsForDate } from '@/utils/calendar';

const CALENDAR_HEIGHT = 576;

export default function CalendarView() {
	const [currentDate, setCurrentDate] = useState(dayjs().startOf('month'));
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [hideCompleted, setHideCompleted] = useState(false);

	const { data: commissions = [] } = useQuery(commissionQueries.getCommissions());
	const drag = useCalendarDragDrop(commissions);

	const year = currentDate.year();
	const month = currentDate.month();

	const goTo = (offset: number) => {
		setCurrentDate(currentDate.add(offset, 'month').startOf('month'));
		setSelectedDate(null);
	};

	const visibleCommissions = hideCompleted
		? commissions.filter((c) => c.status !== 'complete' && c.status !== 'cancelled')
		: commissions;

	const weeks = buildCalendarCells(year, month);
	const rowHeight = Math.round(CALENDAR_HEIGHT / weeks.length);

	const selectedDateCommissions = selectedDate
		? getCommissionsForDate(commissions, selectedDate)
		: [];

	const toggleDate = (dateStr: string) =>
		setSelectedDate((p) => (p === dateStr ? null : dateStr));

	return (
		<AppLayout>
			{/* ── Header ─────────────────────────────────── */}
			<div className='flex items-end justify-between mb-6'>
				<div>
					<p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
						캘린더
					</p>
					<h1 className='text-3xl font-display font-bold tracking-tight mt-0.5'>
						{year}년 {month + 1}월
					</h1>
				</div>

				<div className='flex items-center gap-3'>
					{/* 완료 숨기기 */}
					<div className='flex items-center gap-2'>
						<span className='hidden md:block text-xs text-muted-foreground'>완료 숨기기</span>
						<button
							type='button'
							role='switch'
							aria-checked={hideCompleted}
							onClick={() => setHideCompleted((p) => !p)}
							className={cn(
								'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
								hideCompleted ? 'bg-foreground' : 'bg-muted-foreground/30',
							)}
						>
							<span
								className={cn(
									'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200',
									hideCompleted ? 'translate-x-4' : 'translate-x-0',
								)}
							/>
						</button>
					</div>

					{/* Month nav */}
					<div className='flex items-center gap-1 bg-card border rounded-2xl shadow-sm overflow-hidden'>
						<button
							onClick={() => goTo(-1)}
							className='p-2 hover:bg-muted/50 transition-colors'
							aria-label='이전 달'
						>
							<ChevronLeft className='h-4 w-4' />
						</button>
						<button
							onClick={() => setCurrentDate(dayjs().startOf('month'))}
							className='px-2 py-1.5 text-xs font-semibold hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground'
						>
							오늘
						</button>
						<button
							onClick={() => goTo(1)}
							className='p-2 hover:bg-muted/50 transition-colors'
							aria-label='다음 달'
						>
							<ChevronRight className='h-4 w-4' />
						</button>
					</div>
				</div>
			</div>

			{/* ── Calendar ───────────────────────────────── */}
			<div className='bg-card rounded-3xl border shadow-sm overflow-hidden'>
				{/* 요일 헤더 */}
				<div className='grid grid-cols-7 border-b border-border/50'>
					{WEEK_KOR.map((w, i) => (
						<div
							key={w}
							className={cn(
								'py-3 text-center text-[11px] font-semibold tracking-widest uppercase',
								i === 0
									? 'text-destructive/70'
									: i === 6
										? 'text-[hsl(var(--warning))]'
										: 'text-muted-foreground',
							)}
						>
							{w}
						</div>
					))}
				</div>

				{/* 날짜 행 */}
				<div style={{ height: CALENDAR_HEIGHT }} className='overflow-hidden'>
					<AnimatePresence initial={false}>
						{weeks.map((week, weekIdx) => (
							<motion.div
								key={weekIdx}
								className='grid grid-cols-7 border-b border-border/30 last:border-b-0'
								animate={{ height: rowHeight }}
								transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
								style={{ height: rowHeight }}
							>
								{week.map((cell, dayIdx) => {
									const dateStr = cell.currentMonth
										? buildCalendarDateStr(year, month, cell.day)
										: '';
									const dayCommissions = cell.currentMonth
										? getCommissionsForDate(visibleCommissions, dateStr)
										: [];
									return (
										<CalendarDayCell
											key={dayIdx}
											day={cell.day}
											currentMonth={cell.currentMonth}
											dateStr={dateStr}
											dayIdx={dayIdx}
											dayCommissions={dayCommissions}
											selectedDate={selectedDate}
											dragOverDate={drag.dragOverDate}
											draggingId={drag.draggingId}
											onSelect={toggleDate}
											onDragOver={drag.handleDragOver}
											onDrop={drag.handleDrop}
											onDragLeave={drag.handleDragLeave}
											onDragStart={drag.handleDragStart}
											onDragEnd={drag.handleDragEnd}
											year={year}
											month={month}
										/>
									);
								})}
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>

			{/* ── 선택 날짜 패널 ─────────────────────────── */}
			<SelectedDatePanel
				selectedDate={selectedDate}
				commissions={selectedDateCommissions}
				onClose={() => setSelectedDate(null)}
			/>
		</AppLayout>
	);
}
