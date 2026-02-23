import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import sobbingImg from '@/assets/sobbing.png';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-6'>
      <div className='text-center'>
        <div>
          <img src={sobbingImg} className='h-[40px] mx-auto' />
          <p className='-mt-[54px] text-[120px] font-bold text-primary/20 font-display'>404</p>
        </div>
        <h1 className='mt-2 text-xl font-semibold font-display'>페이지를 찾을 수 없어요</h1>
        <p className='mt-2 text-sm text-muted-foreground'>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      </div>
      <Button variant='ghost' className='gap-2 text-muted-foreground hover:bg-foreground/5' onClick={() => navigate('/')}>
        <ArrowLeft className='h-4 w-4' /> 홈으로 돌아가기
      </Button>
    </div>
  );
};

export default NotFound;
