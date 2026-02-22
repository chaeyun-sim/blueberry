import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getRecentRecommendations, MusicRecommendation, recommendationPool } from '@/mock/recommendations';
import { categoryStyle } from '@/styles/recommend.styles';
import { formatDate } from '@/utils/format-date';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SidePanelProps {
  selectedRec: MusicRecommendation | null;
  workedSongs: Set<number>;
  setSelectedRec: (rec: MusicRecommendation) => void;
}

function SidePanel({ selectedRec, workedSongs, setSelectedRec }: SidePanelProps) {
  const recentRecs = getRecentRecommendations(5);
  const [query, setQuery] = useState('');

  const searchResults = query.trim()
    ? recommendationPool.filter(r => {
        const q = query.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.englishTitle.toLowerCase().includes(q) ||
          r.composer.toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <div className='space-y-4'>
      {/* 검색 */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
        <input
          type='text'
          placeholder='곡명 또는 작곡가 검색'
          value={query}
          onChange={e => setQuery(e.target.value)}
          className='w-full pl-8 pr-8 py-2 text-sm rounded-md border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground'
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
            {searchResults.map(r => {
              const isSelected = selectedRec?.id === r.id;
              const done = workedSongs.has(r.id);
              return (
                <button
                  key={r.id}
                  className={cn(
                    'w-full text-left px-4 py-3 border-t border-border/50 first:border-t-0 transition-colors focus:outline-none',
                    isSelected ? 'bg-primary/5' : 'hover:bg-muted/40',
                    'cursor-pointer',
                  )}
                  onClick={() => { setSelectedRec(r); setQuery(''); }}
                >
                  <p className='text-sm font-medium leading-snug'>
                    {r.title}
                    {done && (
                      <span className='ml-1.5 text-[10px] text-muted-foreground'>(작업완료)</span>
                    )}
                  </p>
                  <p className='text-xs text-muted-foreground'>{r.composer}</p>
                  <span
                    className={cn(
                      'inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border',
                      categoryStyle[r.category],
                    )}
                  >
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

      <h2 className='text-sm font-medium text-muted-foreground'>최근 추천</h2>
      <Card className='border-border/50 overflow-hidden'>
        <CardContent className='p-0'>
          {recentRecs.map(({ date, rec: r }) => {
            const isSelected = selectedRec?.id === r.id;
            const done = workedSongs.has(r.id);
            return (
              <button
                key={date.format('YYYY-MM-DD')}
                disabled={done}
                className={cn(
                  'w-full text-left px-4 py-3 border-t border-border/50 first:border-t-0 transition-colors focus:outline-none',
                  isSelected ? 'bg-primary/5' : !done && 'hover:bg-muted/40',
                  done ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                )}
                onClick={() => !done && setSelectedRec(r)}
              >
                <p className='text-[11px] text-muted-foreground mb-1'>{formatDate(date)}</p>
                <p className='text-sm font-medium leading-snug'>
                  {r.title}
                  {done && (
                    <span className='ml-1.5 text-[10px] text-muted-foreground'>(작업완료)</span>
                  )}
                </p>
                <p className='text-xs text-muted-foreground'>{r.composer}</p>
                <div className='flex items-center gap-1.5 mt-1.5'>
                  <span
                    className={cn(
                      'text-[10px] font-medium px-1.5 py-0.5 rounded-full border',
                      categoryStyle[r.category],
                    )}
                  >
                    {r.category}
                  </span>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* 추천 현황 */}
      <Card className='border-border/50'>
        <CardHeader className='pb-2 pt-4'>
          <CardTitle className='text-sm font-display'>추천 현황</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 pb-4'>
          {(['CLASSIC', 'OST', 'ANI', 'ETC'] as const).map(cat => {
            const count = recommendationPool.filter(r => r.category === cat).length;
            const pct = Math.round((count / recommendationPool.length) * 100);
            return (
              <div
                key={cat}
                className='space-y-1'
              >
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>{cat}</span>
                  <span className='tabular-nums'>{count}곡</span>
                </div>
                <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
                  <div
                    className='h-full rounded-full bg-primary/60'
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {workedSongs.size > 0 && (
            <p className='text-xs text-muted-foreground pt-1'>
              작업 완료 {workedSongs.size}곡 · 잔여 {recommendationPool.length - workedSongs.size}곡
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SidePanel;
