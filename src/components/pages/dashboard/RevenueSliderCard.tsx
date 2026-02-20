import RollingNumber from '@/components/RollingNumber';
import { AnimatePresence, motion } from 'framer-motion';
import { DollarSign, Link, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

function RevenueSliderCard() {
  const revenueSlides = [
    { label: '올해 총 매출', value: 28450000, sub: '전년 대비 +22.4%', up: true },
    { label: '지난 달 매출', value: 2340000, sub: '전월 대비 +15.2%', up: true },
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
          <p className='text-xs text-[hsl(var(--success))] flex items-center gap-0.5'>
            <TrendingUp className='h-3 w-3' /> {revenueSlides[slideIdx].sub}
          </p>
        </motion.div>
      </AnimatePresence>
      <div className='flex gap-1.5 mt-3'>
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
