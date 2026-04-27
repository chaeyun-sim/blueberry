import { useState, DragEvent } from 'react';
import dayjs from 'dayjs';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { commissionQueries } from '@/api/commission/queries';
import { commissionMutations } from '@/api/commission/mutations';
import { commissionKeys } from '@/api/commission/queryKeys';
import { WEEK_KOR } from '@/constants/week';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/utils/query-client';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/pages/commission/StatusBadge';

const CALENDAR_HEIGHT = 576;

const getChipStyle = (deadline: string, status: string) => {
	const today = dayjs().startOf('day');
	const d = dayjs(deadline);
	if (status === 'complete') return 'bg-muted/60 text-muted-foreground';
	if (status === 'cancelled') return 'bg-muted/40 text-muted-foreground/50 line-through';
	if (d.isBefore(today)) return 'bg-[hsl(var(--destructive)/0.15)] text-destructive font-semibold';
	if (d.diff(today, 'day') <= 3) return 'bg-[hsl(var(--destructive)/0.15)] text-destructive font-semibold animate-pulse';
	return 'bg-primary/10 text-primary font-semibold';
};

type Cell = { day: number; currentMonth: boolean };

export default function CalendarView() {
	const navigate = useNavigate();
	const today = dayjs();

	const [currentDate, setCurrentDate] = useState(dayjs().startOf('month'));
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [hideCompleted, setHideCompleted] = useState(false);
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [dragOverDate, setDragOverDate] = useState<string | null>(null);

	const { data: commissions = [] } = useQuery(commissionQueries.getCommissions());
	const { mutate: updateDeadline } = useMutation(commissionMutations.updateCommission());

	const year = currentDate.year();
	const month = currentDate.month();

	const firstDay = dayjs().year(year).month(month).date(1).day();
	const daysInMonth = dayjs().year(year).month(month).daysInMonth();
	const prevMonthDays = dayjs().year(year).month(month - 1).daysInMonth();

	const goTo = (offset: number) => {
		setCurrentDate(currentDate.add(offset, 'month').startOf('month'));
		setSelectedDate(null);
	};

	const visibleCommissions = hideCompleted
		? commissions.filter((c) => c.status !== 'complete' && c.status !== 'cancelled')
		: commissions;

	const getCommissionsForDate = (dateStr: string) =>
		visibleCommissions.filter((c) => dayjs(c.deadline).format('YYYY-MM-DD') === dateStr);

	const getAllCommissionsForDate = (dateStr: string) =>
		commissions.filter((c) => dayjs(c.deadline).format('YYYY-MM-DD') === dateStr);

	const formatDate = (d: number) => {
		const m = String(month + 1).padStart(2, '0');
		const dd = String(d).padStart(2, '0');
		return `${year}-${m}-${dd}`;
	};

	const isToday = (d: number) =>
		year === today.year() && month === today.month() && d === today.date();

	const handleDragStart = (e: DragEvent<HTMLButtonElement>, id: string) => {
		e.dataTransfer.effectAllowed = 'move';
		setDraggingId(id);
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>, dateStr: string) => {
		if (!draggingId) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		setDragOverDate(dateStr);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>, dateStr: string) => {
		e.preventDefault();
		if (!draggingId) return;
		const commission = commissions.find((c) => c.id === draggingId);
		if (commission && dayjs(commission.deadline).format('YYYY-MM-DD') !== dateStr) {
			updateDeadline(
				{ commissionId: draggingId, input: { deadline: dateStr } },
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
						toast.success('마감일이 변경되었습니다.');
					},
					onError: () => toast.error('마감일 변경에 실패했습니다.'),
				},
			);
		}
		setDraggingId(null);
		setDragOverDate(null);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverDate(null);
	};

	const handleDragEnd = () => {
		setDraggingId(null);
		setDragOverDate(null);
	};

	const cells: Cell[] = [];
	for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, currentMonth: false });
	for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, currentMonth: true });
	const remaining = 7 - (cells.length % 7);
	if (remaining < 7) for (let i = 1; i <= remaining; i++) cells.push({ day: i, currentMonth: false });

	const weeks: Cell[][] = [];
	for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
	const rowHeight = Math.round(CALENDAR_HEIGHT / weeks.length);

	const monthCommissions = commissions.filter((c) => {
		const d = dayjs(c.deadline);
		return d.year() === year && d.month() === month;
	});

	const selectedDateCommissions = selectedDate ? getAllCommissionsForDate(selectedDate) : [];

	return (
		<AppLayout>
			{/* ── Header ─────────────────────────────────── */}
			<div className='flex items-center justify-between mb-6'>
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
								i === 0 ? 'text-destructive/70' : i === 6 ? 'text-[hsl(var(--warning))]' : 'text-muted-foreground',
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
									const dateStr = cell.currentMonth ? formatDate(cell.day) : '';
									const dayCommissions = cell.currentMonth ? getCommissionsForDate(dateStr) : [];
									const isSun = dayIdx === 0;
									const isSat = dayIdx === 6;
									const isSelected = cell.currentMonth && selectedDate === dateStr;
									const isDragTarget = cell.currentMonth && dragOverDate === dateStr;

									return (
										<div
											key={dayIdx}
											role='button'
											tabIndex={0}
											onKeyDown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													if (cell.currentMonth) setSelectedDate((p) => (p === dateStr ? null : dateStr));
												}
											}}
											className={cn(
												'group relative flex flex-col px-1.5 pt-1.5 overflow-hidden border-r border-border/30 last:border-r-0 h-full transition-colors',
												!cell.currentMonth && 'bg-muted/10',
												cell.currentMonth && 'cursor-pointer hover:bg-muted/20',
												isSelected && 'bg-primary/5 ring-1 ring-inset ring-primary/20',
												isDragTarget && '!bg-primary/10 ring-1 ring-inset ring-primary/30',
											)}
											onClick={() => {
												if (!cell.currentMonth) return;
												setSelectedDate((p) => (p === dateStr ? null : dateStr));
											}}
											onDragOver={cell.currentMonth ? (e) => handleDragOver(e, dateStr) : undefined}
											onDragLeave={handleDragLeave}
											onDrop={cell.currentMonth ? (e) => handleDrop(e, dateStr) : undefined}
										>
											{/* 날짜 + + 버튼 */}
											<div className='flex items-center justify-between mb-1 shrink-0'>
												<span
													className={cn(
														'inline-flex items-center justify-center w-6 h-6 text-[11px] rounded-full font-medium',
														!cell.currentMonth && 'text-muted-foreground/20',
														cell.currentMonth && isSun && 'text-destructive',
														cell.currentMonth && isSat && 'text-[hsl(var(--warning))]',
														cell.currentMonth && !isSun && !isSat && 'text-foreground',
														isToday(cell.day) && cell.currentMonth &&
															'bg-foreground text-background font-bold ring-2 ring-foreground/20 ring-offset-1 ring-offset-background',
													)}
												>
													{cell.day}
												</span>
												{cell.currentMonth && (
													<button
														type='button'
														onClick={(e) => {
															e.stopPropagation();
															navigate(`/new?deadline=${dateStr}`);
														}}
														className='opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40'
														aria-label="의뢰 추가"
													>
														<Plus className='h-3 w-3' />
													</button>
												)}
											</div>

											{/* 의뢰 칩 */}
											<div className='flex flex-col gap-0.5 overflow-hidden flex-1 min-h-0'>
												{dayCommissions.slice(0, 3).map((c) => (
													<button
														type='button'
														key={c.id}
														draggable
														onDragStart={(e) =>
															handleDragStart(e as unknown as DragEvent<HTMLButtonElement>, c.id)
														}
														onDragEnd={handleDragEnd}
														className={cn(
															'w-full text-[10px] leading-none px-1.5 py-[3px] rounded-lg cursor-grab active:cursor-grabbing truncate font-medium transition-opacity hover:opacity-70 text-left shrink-0',
															getChipStyle(c.deadline, c.status),
															draggingId === c.id && 'opacity-30',
														)}
														onClick={(e) => {
															e.stopPropagation();
															navigate(`/commissions/${c.id}`);
														}}
														title={`${c.songs?.title ?? c.title} — ${c.arrangement}`}
													>
														{c.songs?.title ?? c.title}
													</button>
												))}
												{dayCommissions.length > 3 && (
													<span className='text-[10px] text-muted-foreground/60 pl-1 shrink-0'>
														+{dayCommissions.length - 3}
													</span>
												)}
											</div>
										</div>
									);
								})}
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>

			{/* ── 선택 날짜 패널 ─────────────────────────── */}
			<AnimatePresence>
				{selectedDate && (
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 8 }}
						transition={{ duration: 0.18, ease: 'easeOut' }}
						className='mt-4'
					>
						<div className='bg-card rounded-3xl border shadow-sm p-6'>
							<div className='flex items-center justify-between mb-4'>
								<div>
									<p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>
										선택된 날짜
									</p>
									<h3 className='text-xl font-display font-bold mt-0.5'>
										{dayjs(selectedDate).format('M월 D일')}
										<span className='text-base text-muted-foreground font-normal ml-2'>
											({WEEK_KOR[dayjs(selectedDate).day()]}) · {selectedDateCommissions.length}건
										</span>
									</h3>
								</div>
								<button
									onClick={() => setSelectedDate(null)}
									className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'
								aria-label="날짜 선택 닫기"
								>
									<X className='h-4 w-4' />
								</button>
							</div>

							{selectedDateCommissions.length === 0 ? (
								<p className='text-sm text-muted-foreground text-center py-6'>
									이 날 의뢰가 없어요.
								</p>
							) : (
								<div className='space-y-2'>
									{selectedDateCommissions.map((c) => (
										<button
											key={c.id}
											type='button'
											onClick={() => navigate(`/commissions/${c.id}`)}
											className='w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-colors text-left group'
										>
											<div className='min-w-0 flex-1'>
												<p className='text-sm font-semibold truncate group-hover:text-primary transition-colors'>
													{c.songs?.title ?? c.title}
												</p>
												<p className='text-[11px] text-muted-foreground mt-0.5 truncate'>
													{[c.songs?.composer ?? c.composer, c.arrangement].filter(Boolean).join(' · ')}
												</p>
											</div>
											<StatusBadge status={c.status} className='shrink-0' />
										</button>
									))}
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</AppLayout>
	);
}
