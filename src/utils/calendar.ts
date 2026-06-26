import dayjs from 'dayjs';

import { CommissionStatus } from '@/constants/status-config';

export type CommissionForCalendar = {
	id: string;
	deadline: string;
	status: CommissionStatus;
	title?: string | null;
	composer?: string | null;
	arrangement?: string | null;
	songs?: { title?: string | null; composer?: string | null } | null;
};

export const getChipStyle = (deadline: string, status: string): string => {
	const today = dayjs().startOf('day');
	const d = dayjs(deadline);
	if (status === 'complete') return 'bg-muted/60 text-muted-foreground';
	if (status === 'cancelled') return 'bg-muted/40 text-muted-foreground/50 line-through';
	if (d.isBefore(today)) return 'bg-[hsl(var(--destructive)/0.15)] text-destructive font-semibold';
	if (d.diff(today, 'day') <= 3) return 'bg-[hsl(var(--destructive)/0.15)] text-destructive font-semibold animate-pulse';
	return 'bg-primary/10 text-primary font-semibold';
};

export const STATUS_PRIORITY: Record<string, number> = {
	received: 0,
	working: 1,
	complete: 2,
	delivered: 3,
	cancelled: 4,
};

export const buildCalendarDateStr = (year: number, month: number, day: number): string => {
	const m = String(month + 1).padStart(2, '0');
	const d = String(day).padStart(2, '0');
	return `${year}-${m}-${d}`;
};

export const isCalendarToday = (year: number, month: number, day: number): boolean => {
	const today = dayjs();
	return year === today.year() && month === today.month() && day === today.date();
};

export const getCommissionsForDate = (
	commissions: CommissionForCalendar[],
	dateStr: string,
): CommissionForCalendar[] =>
	commissions
		.filter((c) => dayjs(c.deadline).format('YYYY-MM-DD') === dateStr)
		.sort((a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99));

export type CalendarCell = { day: number; currentMonth: boolean };

export function buildCalendarCells(year: number, month: number): CalendarCell[][] {
	const firstDay = dayjs().year(year).month(month).date(1).day();
	const daysInMonth = dayjs().year(year).month(month).daysInMonth();
	const prevMonthDays = dayjs().year(year).month(month - 1).daysInMonth();

	const cells: CalendarCell[] = [];
	for (let i = firstDay - 1; i >= 0; i--)
		cells.push({ day: prevMonthDays - i, currentMonth: false });
	for (let d = 1; d <= daysInMonth; d++)
		cells.push({ day: d, currentMonth: true });
	const remaining = 7 - (cells.length % 7);
	if (remaining < 7)
		for (let i = 1; i <= remaining; i++)
			cells.push({ day: i, currentMonth: false });

	const weeks: CalendarCell[][] = [];
	for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
	return weeks;
}
