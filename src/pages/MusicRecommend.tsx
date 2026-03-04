import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { type MusicRecommendation, getDailyRecommendation } from '@/mock/recommendations';
import { useWorkedSongs } from '@/hooks/use-worked-songs';
import { RecommendCard } from '@/components/pages/recommend/RecommendCard';
import SidePanel from '@/components/pages/recommend/SidePanel';
import { recommendationQueries } from '@/api/recommendation/queries';
import { useAuth } from '@/hooks/use-auth';

function MusicRecommend() {
  const { isGuest } = useAuth();
  const { workedSongs, markAsWorked, unmarkAsWorked } = useWorkedSongs();
  const [selectedRec, setSelectedRec] = useState<MusicRecommendation | null>(null);

  const mockTodayRec = useMemo(() => getDailyRecommendation(), []);
  const { data: todayRec, isPending, isError } = useQuery({
    ...recommendationQueries.today(),
    enabled: !isGuest,
  });

  const rec = selectedRec ?? (isGuest ? mockTodayRec : todayRec);

  if (!isGuest && isPending) {
    return (
      <AppLayout>
        <div className='h-full overflow-auto' role="status">
          <PageHeader title='음악 추천' description='클래식 & 연주곡 편곡 추천' />
          <p className='text-sm text-muted-foreground animate-pulse'>오늘의 추천곡을 불러오는 중...</p>
        </div>
      </AppLayout>
    );
  }

  if (!isGuest && (isError || !rec)) {
    return (
      <AppLayout>
        <div className='h-full overflow-auto'>
          <PageHeader title='음악 추천' description='클래식 & 연주곡 편곡 추천' />
          <p className='text-sm text-muted-foreground'>
            {isError ? '추천곡을 불러오지 못했습니다.' : '오늘의 추천곡이 아직 준비되지 않았어요. 잠시 후 다시 확인해줘요!'}
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='h-full overflow-auto'>
        <PageHeader
          title='음악 추천'
          description='클래식 & 연주곡 편곡 추천'
        />

        <div className='grid lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <RecommendCard
              rec={rec}
              isSelectedRec={!!selectedRec}
              isWorked={workedSongs.has(rec.id)}
              onResetSelection={() => setSelectedRec(null)}
              onRefresh={() => setSelectedRec(null)}
              onMarkAsWorked={() => { markAsWorked(rec.id); setSelectedRec(null); }}
              onUnmarkAsWorked={() => unmarkAsWorked(rec.id)}
            />
          </div>

          <SidePanel
            selectedRec={selectedRec}
            workedSongs={workedSongs}
            setSelectedRec={setSelectedRec}
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default MusicRecommend;
