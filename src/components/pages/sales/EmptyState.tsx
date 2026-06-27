import { ReactNode } from 'react';

const DEFAULT_MESSAGE = '데이터가 없습니다. 매출 데이터를 업로드하면 확인할 수 있어요.';

interface EmptyStateProps {
  children: ReactNode;
  data: unknown[];
  message?: string;
}

export function EmptyState({ children, data, message = DEFAULT_MESSAGE }: EmptyStateProps) {
  return data.length > 0 ? (
    <>{children}</>
  ) : (
    <p className='text-sm text-muted-foreground py-8 text-center'>{message}</p>
  );
}
