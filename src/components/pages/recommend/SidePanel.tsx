import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MusicRecommendation, recommendationPool, getRecentRecommendations as getMockRecentRecs } from '@/mock/recommendations';
import { recommendationQueries } from '@/api/recommendation/queries';
import { categoryStyle } from '@/styles/recommend.styles';
import { formatDate } from '@/utils/format-date';
import { Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '@/provider/AuthProvider';

interface SidePanelProps {
  selectedRec: MusicRecommendation | null;
  workedSongs: Set<string>;
  setSelectedRec: (rec: MusicRecommendation | null) => void;
}

function SidePanel({ selectedRec, workedSongs, setSelectedRec }: SidePanelProps) {
  const { isGuest } = useAuth();
  const [query, setQuery] = useState('');

  const mockRecentRecs = useMemo(
    () => getMockRecentRecs(5).map(({ date, rec }) => ({ date: date.toISOString(), rec })),
    [],
  );

  const { data: apiAllRecs = [] } = useQuery({ ...recommendationQueries.list(), enabled: !isGuest });
  const { data: apiRecentRecs = [] } = useQuery({ ...recommendationQueries.recent(5), enabled: !isGuest });

  const allRecs = isGuest ? recommendationPool : apiAllRecs;
  const recentRecs = isGuest ? mockRecentRecs : apiRecentRecs;

  const searchResults = query.trim()
    ? allRecs.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.englishTitle.toLowerCase().includes(q) ||
          r.composer.toLowerCase().includes(q)
        );
      })
    : [];

  const categoryCount = (['CLASSIC', 'OST', 'ANI', 'ETC'] as const).map((cat) => ({
    cat,
    count: allRecs.filter((r) => r.category === cat).length,
  }));

  return (
    <div className='space-y-4'>
      {/* 검색 */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
        <input
          type='text'
          placeholder={isGuest ? '로그인 후 검색할 수 있어요' : '곡명 또는 작곡가 검색'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isGuest}
          className='w-full pl-8 pr-8 py-2 text-sm rounded-md border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
          aria-label='곡명 또는 작곡가 검색'
        />
        {query && (
          <button
            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
            onClick={() => setQuery('')}
          >
            <X className='h-3.5 w-3.5' />
          </button>
        )}
      </div>

      {/* 검색 결과 */}
      {searchResults.length > 0 && (
        <Card className='border-border/50 overflow-hidden'>
          <CardContent className='p-0'>
            {searchResults.map((r) => {
              const isSelected = selectedRec?.id === r.id;
              const done = workedSongs.has(r.id);
              return (
                <button
                  key={r.id}
                  disabled={done}
                  className={cn(
                    'w-full text-left px-4 py-3 border-t border-border/50 first:border-t-0 transition-colors focus:outline-none',
                    isSelected ? 'bg-primary/5' : !done && 'hover:bg-muted/40',
                    done ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                  )}
                  onClick={() => { if (!done) { setSelectedRec(r); setQuery(''); } }}
                >
                  <p className='text-sm font-medium leading-snug'>
                    {r.title}
                    {done && <span className='ml-1.5 text-[10px] text-muted-foreground'>(작업완료)</span>}
                  </p>
                  <p className='text-xs text-muted-foreground'>{r.composer}</p>
                  <span className={cn('inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border', categoryStyle[r.category])}>
                    {r.category}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}
      {query.trim() && searchResults.length === 0 && (
        <p className='text-xs text-muted-foreground text-center py-2'>검색 결과가 없습니다</p>
      )}

      {/* 최근 추천 */}
      <h2 className='text-sm font-medium text-muted-foreground'>최근 추천</h2>
      {recentRecs.length === 0 ? (
        <p className='text-xs text-muted-foreground text-center py-2'>아직 추천 기록이 없어요</p>
      ) : (
        <Card className='border-border/50 overflow-hidden'>
          <CardContent className='p-0'>
            {recentRecs.map(({ date, rec: r }) => {
              const isSelected = selectedRec?.id === r.id;
              const done = workedSongs.has(r.id);
              return (
                <button
                  key={r.id}
                  disabled={done}
                  className={cn(
                    'w-full text-left px-4 py-3 border-t border-border/50 first:border-t-0 transition-colors focus:outline-none',
                    isSelected ? 'bg-primary/5' : !done && 'hover:bg-muted/40',
                    done ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                  )}
                  onClick={() => !done && setSelectedRec(r)}
                >
                  <p className='text-[11px] text-muted-foreground mb-1'>{formatDate(dayjs(date))}</p>
                  <p className='text-sm font-medium leading-snug'>
                    {r.title}
                    {done && <span className='ml-1.5 text-[10px] text-muted-foreground'>(작업완료)</span>}
                  </p>
                  <p className='text-xs text-muted-foreground'>{r.composer}</p>
                  <span className={cn('inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border', categoryStyle[r.category])}>
                    {r.category}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* 추천 현황 */}
      {allRecs.length > 0 && (
        <Card className='border-border/50'>
          <CardHeader className='pb-2 pt-4'>
            <CardTitle className='text-sm font-display'>추천 현황</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 pb-4'>
            {categoryCount.map(({ cat, count }) => {
              const pct = Math.round((count / allRecs.length) * 100);
              return (
                <div key={cat} className='space-y-1'>
                  <div className='flex justify-between text-xs'>
                    <span className='text-muted-foreground'>{cat}</span>
                    <span className='tabular-nums'>{count}곡</span>
                  </div>
                  <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
                    <div className='h-full rounded-full bg-primary/60' style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {workedSongs.size > 0 && (
              <p className='text-xs text-muted-foreground pt-1'>
                작업 완료 {workedSongs.size}곡 · 잔여 {allRecs.length - workedSongs.size}곡
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SidePanel;
