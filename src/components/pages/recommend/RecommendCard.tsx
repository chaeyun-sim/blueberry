import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, SkipForward, PenLine, RotateCcw } from 'lucide-react';
import { type MusicRecommendation } from '@/mock/recommendations';
import { formatDate } from '@/utils/format-date';
import { SoundpostBadge } from './SoundpostBadge';
import { SoundpostLinks } from './SoundpostLinks';
import { useSoundpostCheck } from '@/hooks/use-soundpost-check';

interface Props {
  rec: MusicRecommendation;
  isSelectedRec: boolean;
  isWorked: boolean;
  onResetSelection: () => void;
  onRefresh: () => void;
  onMarkAsWorked: () => void;
  onUnmarkAsWorked: () => void;
}

export function RecommendCard({
  rec,
  isSelectedRec,
  isWorked,
  onResetSelection,
  onRefresh: _onRefresh,
  onMarkAsWorked,
  onUnmarkAsWorked,
}: Props) {
  const navigate = useNavigate();

  const { status: soundpostStatus, titleUrl, composerUrl } = useSoundpostCheck(rec);

  const today = dayjs();
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.youtubeQuery)}`;

  return (
    <Card className='border-border/50'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-display'>
            {isSelectedRec ? '선택한 추천곡' : `오늘의 추천 · ${formatDate(today)}`}
          </CardTitle>
          {isSelectedRec && (
            <Button
              variant='ghost'
              size='sm'
              className='gap-1.5 text-xs h-8 text-muted-foreground hover:text-foreground'
              onClick={onResetSelection}
            >
              <RefreshCw className='h-3.5 w-3.5' />
              오늘의 추천으로
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className='space-y-5'>
        {/* 뱃지 행 */}
        <SoundpostBadge
          status={soundpostStatus}
          titleUrl={titleUrl}
          category={rec.category}
          difficulty={rec.difficulty}
        />

        {/* 제목 */}
        <div>
          <h1 className='text-2xl font-display font-bold leading-tight'>
            {rec.title}
            {rec.englishTitle !== rec.title &&
              !/^[a-zA-Z0-9\s.,!?'"()\-#Op./]+$/.test(rec.title) && (
                <span className='text-lg font-normal text-muted-foreground ml-2'>
                  ({rec.englishTitle})
                </span>
              )}
          </h1>
          <p className='text-base text-muted-foreground mt-1'>{rec.composer}</p>
        </div>

        {/* 무드 태그 */}
        <div className='flex flex-wrap gap-1.5'>
          {rec.mood.map(m => (
            <span
              key={m}
              className='text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground'
            >
              {m}
            </span>
          ))}
        </div>

        {/* 설명 */}
        <p className='text-sm text-foreground/80 leading-relaxed'>{rec.description}</p>

        {/* 액션 버튼 */}
        <div className='flex flex-col gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='gap-2 w-full hover:bg-muted'
            onClick={() => window.open(youtubeUrl, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className='h-3.5 w-3.5' />
            YouTube에서 듣기
          </Button>
          <div className='flex gap-2'>
            {isWorked ? (
              <Button
                variant='secondary'
                size='sm'
                className='gap-1.5 flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                onClick={onUnmarkAsWorked}
              >
                <RotateCcw className='h-3.5 w-3.5' />
                건너뛰기 취소
              </Button>
            ) : (
              <Button
                variant='outline'
                size='sm'
                className='gap-1.5 flex-1 hover:bg-muted'
                onClick={onMarkAsWorked}
              >
                <SkipForward className='h-3.5 w-3.5' />
                건너뛰기
              </Button>
            )}
            <Button
              size='sm'
              className='gap-1.5 flex-1'
              onClick={() => navigate('/new')}
            >
              <PenLine className='h-3.5 w-3.5' />
              지금 작업하기
            </Button>
          </div>
        </div>

        <SoundpostLinks
          titleUrl={titleUrl}
          composerUrl={composerUrl}
        />
      </CardContent>
    </Card>
  );
}
