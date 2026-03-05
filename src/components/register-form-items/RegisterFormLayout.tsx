import { Card, CardContent } from '@/components/ui/card';
import { PropsWithChildren } from 'react';
import Button from '../ui/button';

interface RegisterFormLayoutProps {
  type: 'score' | 'commission';
  disabled?: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function RegisterFormLayout({ type, disabled, isSubmitting, onSubmit, children }: PropsWithChildren<RegisterFormLayoutProps>) {
  const text = type === 'score' ? '악보' : '의뢰'
  
  return (
    <Card className='border-border/50'>
      <CardContent className='p-5'>
        <h2 className='font-display font-semibold mb-4'>{`${text} 정보`}</h2>
        <div className='space-y-5'>
          {children}
          <div className='flex pt-2'>
            <Button
              className='flex-1'
              disabled={disabled}
              onClick={onSubmit}
            >
              {isSubmitting ? '등록 중...' : `${text} 등록`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RegisterFormLayout;
