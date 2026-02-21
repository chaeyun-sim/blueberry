import { Sparkles } from 'lucide-react';

export function AiBanner() {
  return (
    <div className='flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/15 text-sm text-muted-foreground mb-6'>
      <Sparkles className='h-3.5 w-3.5 text-primary shrink-0' />
      <span>
        현재는 큐레이션 추천을 제공합니다. 곧{' '}
        <span className='text-primary font-medium'>Claude AI</span>와 연결되어 맞춤 추천을
        제공할 예정이에요!
      </span>
    </div>
  );
}
