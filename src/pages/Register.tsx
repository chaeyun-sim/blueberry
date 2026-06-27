import { Eye, EyeOff, Loader2,Lock, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link,Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { signUp } from '@/api/auth';
import logoImg from '@/assets/logo.webp';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label';
import { useAuth } from '@/provider/AuthContext';

export default function Register() {
	const navigate = useNavigate();
	const { session, loading: authLoading } = useAuth();

	const [form, setForm] = useState({ email: '', password: '', confirm: '' });
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);

	if (authLoading) return null;
	if (session) return <Navigate to='/' replace />;

	const handleRegister = async (e: FormEvent) => {
		e.preventDefault();

		if (!form.email || !form.password || !form.confirm) {
			toast.error('모든 항목을 입력해주세요.');
			return;
		}
		if (form.password.length < 6) {
			toast.error('비밀번호는 6자 이상이어야 합니다.');
			return;
		}
		if (form.password !== form.confirm) {
			toast.error('비밀번호가 일치하지 않습니다.');
			return;
		}

		setLoading(true);
		signUp(form.email, form.password)
			.then((data) => {
				// 이메일 인증이 비활성화된 경우 바로 세션 발급됨
				if (data.session) {
					navigate('/');
				} else {
					setDone(true);
				}
			})
			.catch((err: unknown) => {
				const code = (err as { code?: string })?.code ?? '';
				const msg = (err as { message?: string })?.message ?? '';
				if (code === 'user_already_exists' || msg.includes('already registered')) {
					toast.error('이미 가입된 이메일입니다.');
				} else if (code === 'email_provider_disabled' || msg.includes('Email signups are disabled')) {
					toast.error('현재 이메일 가입이 비활성화되어 있습니다.');
				} else {
					toast.error('회원가입에 실패했습니다.');
				}
			})
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
						<p className='text-sm text-muted-foreground'>
							{done ? '이메일을 확인해주세요' : '새 계정을 만드세요'}
						</p>
					</div>

					{done ? (
						<div className='flex flex-col gap-4 text-center'>
							<p className='text-sm text-muted-foreground'>
								<span className='font-medium text-foreground'>{form.email}</span>
								로 인증 메일을 보냈어요.
								<br />
								메일의 링크를 클릭하면 가입이 완료됩니다.
							</p>
							<Link to='/login'>
								<Button variant='ghost' className='w-full border border-transparent hover:bg-foreground/5'>
									로그인 화면으로
								</Button>
							</Link>
						</div>
					) : (
						<>
							<form onSubmit={handleRegister} className='flex flex-col gap-4'>
								<div className='space-y-1.5'>
									<Label htmlFor='email' className='text-xs font-medium text-muted-foreground'>
										이메일
									</Label>
									<div className='relative'>
										<Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
										<Input
											id='email'
											type='email'
											placeholder='example@email.com'
											value={form.email}
											onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
											className='pl-10'
											disabled={loading}
											autoComplete='email'
										/>
									</div>
								</div>

								<div className='space-y-1.5'>
									<Label htmlFor='password' className='text-xs font-medium text-muted-foreground'>
										비밀번호
									</Label>
									<div className='relative'>
										<Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
										<Input
											id='password'
											type={showPassword ? 'text' : 'password'}
											placeholder='6자 이상'
											value={form.password}
											onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
											className='pl-10 pr-10'
											disabled={loading}
											autoComplete='new-password'
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

								<div className='space-y-1.5'>
									<Label htmlFor='confirm' className='text-xs font-medium text-muted-foreground'>
										비밀번호 확인
									</Label>
									<div className='relative'>
										<Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
										<Input
											id='confirm'
											type={showConfirm ? 'text' : 'password'}
											placeholder='비밀번호 재입력'
											value={form.confirm}
											onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
											className='pl-10 pr-10'
											disabled={loading}
											autoComplete='new-password'
										/>
										<button
											type='button'
											onClick={() => setShowConfirm(!showConfirm)}
											className='absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors py-1 px-2'
											aria-label={showConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
										>
											{showConfirm ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
										</button>
									</div>
								</div>

								<Button type='submit' className='w-full mt-2' disabled={loading}>
									{loading ? <Loader2 className='h-4 w-4 animate-spin' /> : '회원가입'}
								</Button>
							</form>

							<div className='relative my-6'>
								<div className='absolute inset-0 flex items-center'>
									<span className='w-full border-t border-border' />
								</div>
								<div className='relative flex justify-center text-xs'>
									<span className='bg-background px-3 text-muted-foreground'>또는</span>
								</div>
							</div>

							<Link to='/login'>
								<Button variant='ghost' className='w-full border border-transparent hover:bg-foreground/5'>
									이미 계정이 있으신가요? 로그인
								</Button>
							</Link>
						</>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
