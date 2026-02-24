import RollingNumber from '@/components/RollingNumber';
import { AnimatePresence, motion } from 'framer-motion';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsQueries } from '@/api/stats/queries';
import { MONEY_RATIO } from '@/constants/money-ratio';

function RevenueSliderCard() {
  const { data: summary } = useQuery(statsQueries.getSalesSummary());

  const revenueSlides = [
    {
      label: '전체 누적 매출',
      value: (summary?.totalRevenue ?? 0) * MONEY_RATIO,
      sub: null,
      up: true,
    },
    {
      label: '지난 달 매출',
      value: (summary?.lastMonthRevenue ?? 0) * MONEY_RATIO,
      sub: summary?.revenueVsLastMonth != null
        ? `전월 대비 ${summary.revenueVsLastMonth >= 0 ? '+' : ''}${summary.revenueVsLastMonth}%`
        : null,
      up: (summary?.revenueVsLastMonth ?? 0) >= 0,
    },
  ];

  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSlideIdx(p => (p + 1) % revenueSlides.length), 4000);
    return () => clearInterval(timer);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (
    <Link
      to='/stats'
      className='cursor-pointer hover:bg-muted/30 rounded-lg p-3 -m-1 transition-colors'
    >
      <div className='flex items-center justify-between mb-1'>
        <div className='flex items-center gap-1.5 text-muted-foreground'>
          <DollarSign className='h-4 w-4 text-[hsl(var(--success))]' />
          <AnimatePresence mode='wait'>
            <motion.span
              key={slideIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className='text-xs font-medium'
            >
              {revenueSlides[slideIdx].label}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className='text-xs text-muted-foreground'>자세히 →</span>
      </div>
      <AnimatePresence mode='wait'>
        <motion.div
          key={slideIdx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
        >
          <p className='text-3xl font-display font-bold mb-0.5'>
            <RollingNumber value={revenueSlides[slideIdx].value} />
          </p>
          {revenueSlides[slideIdx].sub ? (
            <p className={`text-xs flex items-center gap-0.5 ${revenueSlides[slideIdx].up ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
              {revenueSlides[slideIdx].up
                ? <TrendingUp className='h-3 w-3' />
                : <TrendingDown className='h-3 w-3' />}
              {revenueSlides[slideIdx].sub}
            </p>
          ) : (
            <p className='text-xs text-muted-foreground'>누적 합계</p>
          )}
        </motion.div>
      </AnimatePresence>
      <div className='flex gap-1.5 mt-6'>
        {revenueSlides.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === slideIdx ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </Link>
  );
}

export default RevenueSliderCard;
