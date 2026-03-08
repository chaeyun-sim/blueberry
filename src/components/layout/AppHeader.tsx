import { ArrowLeft } from 'lucide-react';
import Button from '../ui/button';
import { useNavigate } from 'react-router-dom';

function AppHeader({ children }: { children: React.ReactNode }) {
  return <div className='mb-6 flex items-center justify-between'>{children}</div>;
};

const BackButton = () => {
	const navigate = useNavigate();
	
  return (
    <Button
      variant='ghost'
      className='gap-2 pl-0 text-muted-foreground hover:bg-foreground/5'
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className='h-4 w-4' /> 뒤로
    </Button>
  );
};

const Right = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className='flex items-center gap-2'>
			{children}
		</div>
	)
}

AppHeader.Back = BackButton;
AppHeader.Right = Right;

export default AppHeader;