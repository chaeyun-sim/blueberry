import dayjs from 'dayjs';
import { ArrowUpRight, CalendarClock } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Commission } from '@/features/commission/types';

interface Props {
  commissions: Commission[];
}

// 다크 히어로 배경 위에서 쓰는 D-day 칩 스타일
function urgencyChip(days: number) {
  if (days < 0)
    return { label: `+${Math.abs(days)}일 초과`, chip: 'bg-[hsl(0_75%_58%)] text-white' };
  if (days === 0) return { label: '오늘 마감', chip: 'bg-[hsl(0_75%_58%)] text-white' };
  if (days <= 3) return { label: `D-${days}`, chip: 'bg-[hsl(0_72%_58%)] text-white' };
  if (days <= 7) return { label: `D-${days}`, chip: 'bg-[hsl(35_90%_48%)] text-white' };
  return { label: `D-${days}`, chip: 'bg-white/15 text-white/80' };
}

export function DeadlineWidget({ commissions }: Props) {
  const navigate = useNavigate();

  const upcoming = useMemo(
    () =>
      commissions
        .filter((c) => c.status !== 'complete' && c.status !== 'cancelled' && c.deadline)
        .map((c) => ({ ...c, daysLeft: dayjs(c.deadline).diff(dayjs(), 'day') }))
        .filter((c) => c.daysLeft <= 7)
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 8),
    [commissions],
  );

  return (
    <section
      className='relative overflow-hidden rounded-3xl p-5 md:p-7 text-white shadow-sm'
      style={{
        background:
          'radial-gradient(120% 160% at 85% -20%, hsl(252 62% 34%) 0%, hsl(252 55% 22%) 45%, hsl(252 52% 14%) 100%)',
      }}
    >
      {/* 장식용 광원 — 다크 히어로의 밋밋함 방지 */}
      <div
        className='pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-30'
        style={{ background: 'radial-gradient(circle, hsl(192 100% 62% / 0.5), transparent 70%)' }}
      />

      <div className='relative flex items-start justify-between'>
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-widest text-white/50'>
            마감 임박 · 7일 이내
          </p>
          <p className='mt-1 font-display text-4xl font-bold tabular-nums md:text-5xl'>
            {upcoming.length}
            <span className='ml-1.5 text-lg font-normal text-white/50'>건</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/calendar')}
          className='flex items-center gap-1 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/20 active:scale-[0.98]'
        >
          캘린더
          <ArrowUpRight className='h-3.5 w-3.5' />
        </button>
      </div>

      {upcoming.length === 0 ? (
        <div className='relative mt-5 flex items-center gap-3 rounded-2xl bg-white/[0.07] px-4 py-5 md:px-5'>
          <CalendarClock className='h-5 w-5 shrink-0 text-white/40' />
          <div>
            <p className='text-sm font-semibold'>여유 있어요</p>
            <p className='mt-0.5 text-xs text-white/50'>7일 내 마감 예정인 의뢰가 없습니다</p>
          </div>
        </div>
      ) : (
        <>
          {/* 모바일: 세로 리스트 */}
          <div className='relative mt-4 space-y-2 md:hidden'>
            {upcoming.slice(0, 4).map((c) => {
              const { label, chip } = urgencyChip(c.daysLeft);
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/commissions/${c.id}`)}
                  className='flex w-full items-center justify-between gap-3 rounded-2xl bg-white/[0.08] px-4 py-3 text-left transition-colors active:bg-white/[0.16]'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold'>{c.songs?.title ?? c.title}</p>
                    <p className='mt-0.5 truncate text-xs text-white/50'>{c.arrangement}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${chip}`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 데스크톱: 가로 스크롤 카드 */}
          <div className='relative mt-5 hidden gap-3 overflow-x-auto pb-1 scrollbar-hide md:flex'>
            {upcoming.map((c) => {
              const { label, chip } = urgencyChip(c.daysLeft);
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/commissions/${c.id}`)}
                  className='group flex w-52 shrink-0 flex-col justify-between rounded-2xl bg-white/[0.08] p-4 text-left transition-colors hover:bg-white/[0.15] active:scale-[0.99]'
                >
                  <div className='min-w-0'>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${chip}`}
                    >
                      {label}
                    </span>
                    <p className='mt-2.5 line-clamp-2 text-sm font-semibold leading-snug'>
                      {c.songs?.title ?? c.title}
                    </p>
                  </div>
                  <p className='mt-2 truncate text-xs text-white/50'>{c.arrangement}</p>
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
