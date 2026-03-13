import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QueryErrorCardProps {
  onRetry?: () => void;
  message?: string;
  className?: string;
}

export function QueryErrorCard({
  onRetry,
  message = '데이터를 불러올 수 없습니다.',
  className,
}: QueryErrorCardProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-6 text-center', className)}>
      <AlertCircle className='h-8 w-8 text-destructive/60' />
      <p className='text-sm text-muted-foreground'>{message}</p>
      {onRetry && (
        <Button variant='outline' size='sm' onClick={onRetry}>
          <RefreshCw className='h-3.5 w-3.5 mr-1.5' />
          재시도
        </Button>
      )}
    </div>
  );
}
