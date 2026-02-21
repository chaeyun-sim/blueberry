import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getRecentRecommendations, MusicRecommendation, recommendationPool } from '@/mock/recommendations';
import { categoryStyle } from '@/styles/recommend.styles';
import { formatDate } from '@/utils/format-date';

interface SidePanelProps {
  selectedRec: MusicRecommendation | null;
  workedSongs: Set<number>;
  setSelectedRec: (rec: MusicRecommendation) => void;
  effectivePool: MusicRecommendation[];
}

function SidePanel({ selectedRec, workedSongs, setSelectedRec, effectivePool }: SidePanelProps) {
	const recentRecs = getRecentRecommendations(5, effectivePool);

  return (
    <div className='space-y-4'>
      <h2 className='text-sm font-medium text-muted-foreground'>최근 추천</h2>
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
