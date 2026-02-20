import { Card, CardContent } from '@/components/ui/card';
import { WEEK_KOR } from '@/constants/week';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun } from 'lucide-react';
import { Music } from 'lucide-react';
import { History } from 'lucide-react';
import todayDawnImg from "@/assets/today-dawn.png";
import todayDayImg from "@/assets/today-day.jpg";
import todaySunsetImg from "@/assets/today-sunset.jpg";
import todayNightImg from "@/assets/today-night.png";
import useLiveClock from '@/hooks/use-live-clock';
import { mockCommissionSummary, mockRecentCommissions } from '@/mock/dashboard';

function TodayCard() {
  const DAILY_QUOTE = "적게 일하고 돈 많이 벌자 💰";

  const commissionSummary = mockCommissionSummary;
  const recentCommissions = mockRecentCommissions;
  
  const clock = useLiveClock();

	const getFormattedDate = () => {
		return `${clock.getFullYear()}년 ${clock.getMonth() + 1}월 ${clock.getDate()}일 ${WEEK_KOR[clock.getDay()]}요일`;
	}

	const getTodayBg = (hour: number) => {
		if (hour >= 4 && hour < 11) return todayDawnImg;
		if (hour >= 11 && hour < 15) return todayDayImg;
		if (hour >= 15 && hour < 19) return todaySunsetImg;
		return todayNightImg;
	}

	const getGreeting = () => {
		const h = clock.getHours();
		if (h < 6) return "늦은 밤이에요 🌙";
		if (h < 12) return "좋은 아침이에요 ☀️";
		if (h < 18) return "좋은 오후예요 🌤";
		return "좋은 저녁이에요 🌆";
	}

  return (
    <>
      <AnimatePresence mode='wait'>
        <motion.img
          key={getTodayBg(clock.getHours())}
          src={getTodayBg(clock.getHours())}
          alt=''
          className='absolute inset-0 w-full h-full object-cover pointer-events-none'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      </AnimatePresence>
      <div className='absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/10' />
      <CardContent className='p-6 relative z-10'>
        <div className='flex items-center justify-between mb-1'>
          <p className='text-sm text-white/80'>{getFormattedDate()}</p>
          <span className='font-display font-bold text-lg tabular-nums text-white drop-shadow'>
            {clock.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <h2 className='text-2xl font-display font-bold mb-2 text-white drop-shadow'>
          {getGreeting()}
        </h2>
        <p className='text-xs text-white/70 italic mb-4'>"{DAILY_QUOTE}"</p>
        <div className='flex items-center gap-6 text-sm'>
          <div className='flex items-center gap-2 text-white/80'>
            <Sun className='h-4 w-4 text-[hsl(var(--warning))]' />
            <span>맑음 · 4°C</span>
          </div>
          <div className='flex items-center gap-2 text-white/80'>
            <Music className='h-4 w-4' />
            <span>
              진행 중인 의뢰 <strong className='text-white'>{commissionSummary.working}건</strong>
            </span>
          </div>
          <div className='flex items-center gap-2 text-white/80'>
            <History className='h-4 w-4 text-[hsl(var(--success))]' />
            <span>
              최근 업데이트 <strong className='text-white'>{recentCommissions.length}건</strong>
            </span>
          </div>
        </div>
      </CardContent>
    </>
  );
}

export default TodayCard;
