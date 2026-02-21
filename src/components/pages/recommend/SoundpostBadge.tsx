import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SoundpostStatus } from '@/types/recommend';
import { categoryStyle, difficultyStyle } from '@/styles/recommend.styles';
import { type MusicRecommendation } from '@/mock/recommendations';

interface Props {
  status: SoundpostStatus;
  titleUrl: string;
  category: MusicRecommendation['category'];
  difficulty: MusicRecommendation['difficulty'];
}

export function SoundpostBadge({ status, titleUrl, category, difficulty }: Props) {
  return (
    <div className='flex items-center gap-2 flex-wrap'>
      {status === 'loading' && (
        <span className='inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/50'>
          <Loader2 className='h-3 w-3 animate-spin' />
          사이트 확인 중
        </span>
      )}
      {status === 'arranged' && (
        <span className='inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20'>
          ✦ 추가 편성
        </span>
      )}
      {status === 'error' && (
        <button
          className='inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/50 hover:text-foreground transition-colors'
          onClick={() => window.open(titleUrl, '_blank')}
        >
          <AlertCircle className='h-3 w-3' />
          사이트에서 직접 확인
        </button>
      )}

      <span
        className={cn(
          'text-xs font-semibold px-2.5 py-1 rounded-full border',
          categoryStyle[category],
        )}
      >
        {category}
      </span>
      <span
        className={cn(
          'text-xs font-medium px-2.5 py-1 rounded-full',
          difficultyStyle[difficulty],
        )}
      >
        편곡 난이도 {difficulty}
      </span>
    </div>
  );
}
