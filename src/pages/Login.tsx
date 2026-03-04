import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import Label from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, Loader2, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { login } from '@/api/auth';
import { useAuth } from '@/hooks/use-auth';
import logoImg from '@/assets/logo.png';

interface LoginFormType {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { session, loading: authLoading, isGuest, enterGuestMode } = useAuth();

  const [form, setForm] = useState<LoginFormType>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authLoading) return null;
  if (session || isGuest) return <Navigate to='/' replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    login(form.email, form.password)
      .then(() => navigate('/'))
      .catch(() => toast.error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'))
      .finally(() => setLoading(false));
  };

  return (
    <main className='min-h-screen flex items-center justify-center bg-background px-4'>
      <Card className='w-full max-w-sm border-border shadow-lg'>
        <CardContent className='pt-8 pb-8 px-8'>
          <div className='flex flex-col items-center gap-2 mb-8'>
            <img
              src={logoImg}
              alt='로고'
              className='object-contain'
              style={{ width: 48, height: 48 }}
            />
            <h1 className='font-display font-bold text-2xl tracking-tight text-foreground'>
              BlueBerry
            </h1>
            <p className='text-sm text-muted-foreground'>로그인하여 시작하세요</p>
          </div>

          <form
            onSubmit={handleLogin}
            className='flex flex-col gap-4'
          >
            <div className='space-y-1.5'>
              <Label
                htmlFor='email'
                className='text-xs font-medium text-muted-foreground'
              >
                이메일
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='email'
                  type='email'
                  placeholder='example@email.com'
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className='pl-10'
                  disabled={loading}
                  autoComplete='off'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label
                htmlFor='password'
                className='text-xs font-medium text-muted-foreground'
              >
                비밀번호
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={form.password}
                  onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                  className='pl-10 pr-10'
                  disabled={loading}
                  autoComplete='off'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors py-1 px-2'
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
            </div>

            <Button
              type='submit'
              className='w-full mt-2'
              disabled={loading}
            >
              {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : '로그인'}
            </Button>
          </form>

          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-xs'>
              <span className='bg-card px-3 text-muted-foreground'>또는</span>
            </div>
          </div>

          <Button
            variant='ghost'
            className='w-full border border-transparent hover:bg-foreground/5'
            onClick={() => {
              enterGuestMode();
              navigate('/');
            }}
          >
            게스트로 둘러보기
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
