import { cn } from '@/lib/utils';
import { categoryStyle, difficultyStyle } from '@/styles/recommend.styles';
import { type MusicRecommendation } from '@/mock/recommendations';

interface Props {
  category: MusicRecommendation['category'];
  difficulty: MusicRecommendation['difficulty'];
}

export function SoundpostBadge({ category, difficulty }: Props) {
  return (
    <div className='flex items-center gap-2 flex-wrap'>
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
