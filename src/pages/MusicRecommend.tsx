import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { recommendationPool, type MusicRecommendation } from '@/mock/recommendations';
import { useWorkedSongs } from '@/hooks/useWorkedSongs';
import { RecommendCard } from '@/components/pages/recommend/RecommendCard';
import SidePanel from '@/components/pages/recommend/SidePanel';

function MusicRecommend() {
  const { workedSongs, markAsWorked, unmarkAsWorked } = useWorkedSongs();
  const [refreshOffset, setRefreshOffset] = useState(0);
  const [selectedRec, setSelectedRec] = useState<MusicRecommendation | null>(null);

  const availablePool = recommendationPool.filter(r => !workedSongs.has(r.id));
  const effectivePool = availablePool.length > 0 ? availablePool : recommendationPool;

  const baseDayIdx = effectivePool.length > 0 ? dayjs().dayOfYear() % effectivePool.length : 0;
  const dailyRec = effectivePool.length > 0 ? effectivePool[(baseDayIdx + refreshOffset) % effectivePool.length] : null;
  const rec = selectedRec ?? dailyRec;

  const handleMarkAsWorked = useCallback(() => {
    if (!rec) return;
    markAsWorked(rec.id);
    setSelectedRec(null);
    setRefreshOffset(0);
  }, [markAsWorked, rec?.id]);

  const handleRefresh = () => {
    setSelectedRec(null);
    setRefreshOffset(v => v + 1);
  };

  if (effectivePool.length === 0) {
    return (
      <AppLayout>
        <div className='h-full overflow-auto'>
          <PageHeader title='음악 추천' description='클래식 & 연주곡 편곡 추천' />
          <p className='text-sm text-muted-foreground'>추천 가능한 곡이 없습니다.</p>
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
              onRefresh={handleRefresh}
              onMarkAsWorked={handleMarkAsWorked}
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
