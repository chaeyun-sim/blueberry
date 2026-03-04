import React, { ReactNode, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  level?: 'global' | 'page' | 'section';
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `EB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorId } = this.state;
    const { children, level = 'global' } = this.props;

    if (hasError) {
      return <ErrorFallback
        level={level}
        error={error}
        errorId={errorId}
        onReset={this.handleReset}
        onReload={this.handleReload}
      />;
    }

    return children;
  }
}

interface ErrorFallbackProps {
  level: 'global' | 'page' | 'section';
  error: Error | null;
  errorId: string;
  onReset: () => void;
  onReload: () => void;
}

function ErrorFallback({
  level,
  error,
  errorId,
  onReset,
  onReload,
}: ErrorFallbackProps) {
  if (level === 'global') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background p-4'>
        <Card className='w-full max-w-md border-destructive/50'>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center text-center space-y-4'>
              <AlertCircle className='h-12 w-12 text-destructive' />
              <div>
                <h1 className='text-lg font-display font-bold'>
                  문제가 발생했습니다
                </h1>
                <p className='text-sm text-muted-foreground mt-2'>
                  죄송합니다. 예상치 못한 오류가 발생했습니다.
                </p>
              </div>
              {error && (
                <div className='bg-muted p-3 rounded-lg text-left text-xs max-h-24 overflow-y-auto w-full'>
                  <p className='font-mono text-destructive/80'>
                    {error.message}
                  </p>
                </div>
              )}
              <p className='text-xs text-muted-foreground'>
                Error ID: <span className='font-mono'>{errorId}</span>
              </p>
              <div className='flex gap-2 w-full'>
                <Button
                  variant='outline'
                  onClick={onReload}
                  className='flex-1'
                >
                  새로고침
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  className='flex-1'
                >
                  홈으로
                </Button>
              </div>
              <p className='text-xs text-muted-foreground'>
                문제가 지속되면{' '}
                <a href='mailto:bysimune@example.com' className='underline hover:text-foreground'>
                  지원팀에 연락
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (level === 'page') {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Card className='w-full max-w-md border-yellow-500/50'>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center text-center space-y-4'>
              <AlertCircle className='h-10 w-10 text-yellow-600' />
              <div>
                <h2 className='text-base font-display font-bold'>
                  페이지를 불러올 수 없습니다
                </h2>
                <p className='text-sm text-muted-foreground mt-1'>
                  다시 시도하거나 다른 페이지로 이동하세요.
                </p>
              </div>
              <div className='flex gap-2 w-full'>
                <Button
                  variant='outline'
                  onClick={onReset}
                  className='flex-1'
                >
                  재시도
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  className='flex-1'
                >
                  이전
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => window.location.href = '/'}
                  className='flex-1'
                >
                  홈
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // level === 'section'
  return (
    <div className='p-4 rounded-lg border border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20'>
      <div className='flex items-start gap-3'>
        <AlertCircle className='h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5' />
        <div className='flex-1'>
          <p className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
            데이터를 불러올 수 없습니다
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={onReset}
            className='mt-2'
          >
            재시도
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
