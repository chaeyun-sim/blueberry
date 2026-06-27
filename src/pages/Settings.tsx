import { useQuery } from '@tanstack/react-query';
import {
	Bell,
	ChevronDown,
	ChevronUp,
	Eye,
	EyeOff,
	Lock,
	LogOut,
} from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logout } from '@/api/auth';
import logoImg from '@/assets/logo.webp';
import AppHeader from '@/components/layout/AppHeader';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { usePasswordChangeForm } from '@/hooks/use-password-change-form';
import { createPushSubscription, pushQueries } from '@/hooks/use-push';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useAuth } from '@/provider/AuthContext';
import { listUploadedTemplates, TEMPLATE_SLOTS, uploadTemplate } from '@/utils/mxl-template';

export default function Settings() {
	const { session } = useAuth();
	const navigate = useNavigate();

	const { data: pushEnabled = false, refetch: refetchPush } = useQuery(
		pushQueries.hasPushSubscription(session?.user?.id),
	);
	const [pushLoading, setPushLoading] = useState(false);

	const {
		pwOpen, setPwOpen, pwLoading, pwForm, setPwForm, showPw, setShowPw, handleSubmit: handlePasswordChange,
	} = usePasswordChangeForm(session);

	const [uploadingKey, setUploadingKey] = useState<string | null>(null);
	const { data: uploadedTemplates, refetch: refetchTemplates } = useQuery({
		queryKey: ['template-list'],
		queryFn: listUploadedTemplates,
	});

	const handleTemplateUpload = async (key: string, e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploadingKey(key);
		try {
			await uploadTemplate(key, file);
			await refetchTemplates();
			toast.success('템플릿 업로드 완료');
		} catch (err) {
			toast.error('업로드에 실패했어요', {
				description: err instanceof Error ? err.message : undefined,
			});
		} finally {
			setUploadingKey(null);
			e.target.value = '';
		}
	};

	const handlePushToggle = async (checked: boolean) => {
		if (!session?.access_token) {
			toast.error('게스트 모드에서는 푸시 알림을 설정할 수 없습니다.');
			return;
		}

		setPushLoading(true);
		try {
			if (checked) {
				const subscription = await createPushSubscription();
				const { error: fnError } = await supabase.functions.invoke('send-push', {
					body: {
						subscription,
						title: '알림 설정 완료',
						body: '마감일 푸시 알림이 활성화됐어요 🎵',
					},
				});
				if (fnError) throw new Error(`푸시 서버 오류: ${fnError.message}`);
				await refetchPush();
				toast.success('푸시 알림이 활성화됐어요');
			} else {
				const reg = await navigator.serviceWorker.ready;
				const sub = await reg.pushManager.getSubscription();
				await sub?.unsubscribe();
				await supabase
					.from('push_subscriptions')
					.delete()
					.eq('user_id', session.user.id)
					.throwOnError();
				await refetchPush();
				toast.success('푸시 알림이 비활성화됐어요');
			}
		} catch (e) {
			toast.error('알림 설정에 실패했어요', {
				description: e instanceof Error ? e.message : String(e),
			});
		} finally {
			setPushLoading(false);
		}
	};

	const handleLogout = async () => {
		await logout().catch(() => {});
		navigate('/login');
	};

	const uploadedCount = uploadedTemplates?.size ?? 0;

	return (
		<AppLayout>
			<AppHeader>
				<AppHeader.Back />
			</AppHeader>
			<div className='max-w-lg mx-auto'>
				<PageHeader title='설정' />

				<div className='flex flex-col gap-3 mt-6'>
					{/* 프로필 */}
					<section className='rounded-xl border border-border bg-card p-4'>
						<p className='text-xs text-muted-foreground font-medium mb-3'>계정</p>
						<div className='flex items-center gap-3'>
							<div className='w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
								<img src={logoImg} alt='로고' className='w-5 h-5 object-contain' />
							</div>
							<div className='min-w-0'>
								<p className='text-sm font-medium truncate'>{session?.user?.email}</p>
								<p className='text-xs text-muted-foreground'>BlueBerry 계정</p>
							</div>
						</div>
					</section>

					{/* 비밀번호 변경 */}
					<section className='rounded-xl border border-border bg-card p-4'>
						<button
							type='button'
							onClick={() => setPwOpen((v) => !v)}
							className='flex items-center gap-3 w-full text-left'
						>
							<div className='w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
								<Lock className='w-4 h-4 text-primary' />
							</div>
							<p className='text-sm font-medium flex-1'>비밀번호 변경</p>
							{pwOpen ? (
								<ChevronUp className='w-4 h-4 text-muted-foreground' />
							) : (
								<ChevronDown className='w-4 h-4 text-muted-foreground' />
							)}
						</button>

						{pwOpen && (
							<form
								onSubmit={handlePasswordChange}
								className='mt-4 flex flex-col gap-3'
							>
								{(['current', 'next', 'confirm'] as const).map((field) => {
									const labels = {
										current: '현재 비밀번호',
										next: '새 비밀번호',
										confirm: '새 비밀번호 확인',
									};
									return (
										<div key={field} className='relative'>
											<Input
												type={showPw[field] ? 'text' : 'password'}
												placeholder={labels[field]}
												value={pwForm[field]}
												onChange={(e) =>
													setPwForm((v) => ({ ...v, [field]: e.target.value }))
												}
												disabled={pwLoading}
												required
												className='pr-10'
											/>
											<button
												type='button'
												onClick={() => setShowPw((v) => ({ ...v, [field]: !v[field] }))}
												className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
												aria-label={showPw[field] ? '비밀번호 숨기기' : '비밀번호 보기'}
											>
												{showPw[field] ? (
													<EyeOff className='w-4 h-4' />
												) : (
													<Eye className='w-4 h-4' />
												)}
											</button>
										</div>
									);
								})}
								<Button type='submit' disabled={pwLoading} className='w-full'>
									{pwLoading ? '변경 중...' : '변경하기'}
								</Button>
							</form>
						)}
					</section>

					{/* 알림 */}
					<section className='rounded-xl border border-border bg-card p-4'>
						<p className='text-xs text-muted-foreground font-medium mb-3'>알림</p>
						<div className='flex items-center gap-3'>
							<div className='w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
								<Bell className='w-4 h-4 text-primary' />
							</div>
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-medium'>마감일 푸시 알림</p>
								<p className='text-xs text-muted-foreground'>
									당일·1일·2일 전 자동 알림
								</p>
							</div>
							<Switch
								checked={pushEnabled}
								onCheckedChange={handlePushToggle}
								disabled={pushLoading}
								aria-label='마감일 푸시 알림 토글'
							/>
						</div>
					</section>

					{/* Finale 템플릿 */}
					<section className='rounded-xl border border-border bg-card p-4'>
						<div className='flex items-center justify-between mb-3'>
							<p className='text-xs text-muted-foreground font-medium'>Finale 템플릿</p>
							<p className='text-xs text-muted-foreground'>
								{uploadedCount} / {TEMPLATE_SLOTS.length} 업로드됨
							</p>
						</div>
						<div className='space-y-0.5'>
							{TEMPLATE_SLOTS.map((slot) => {
								const isUploaded = uploadedTemplates?.has(slot.key) ?? false;
								const isUploading = uploadingKey === slot.key;
								return (
									<div
										key={slot.key}
										className='flex items-center justify-between py-1.5'
									>
										<div className='flex items-center gap-2'>
											<span
												className={cn(
													'w-1.5 h-1.5 rounded-full shrink-0',
													isUploaded ? 'bg-green-500' : 'bg-muted-foreground/30',
												)}
											/>
											<span className='text-sm'>{slot.label}</span>
										</div>
										<label className='cursor-pointer shrink-0'>
											<input
												type='file'
												accept='.mxl'
												className='hidden'
												onChange={(e) => handleTemplateUpload(slot.key, e)}
												disabled={isUploading}
											/>
											<span
												className={cn(
													'text-xs font-medium transition-opacity',
													isUploading
														? 'text-muted-foreground'
														: isUploaded
															? 'text-muted-foreground hover:text-primary'
															: 'text-primary hover:opacity-70',
												)}
											>
												{isUploading ? '업로드 중...' : isUploaded ? '교체' : '업로드'}
											</span>
										</label>
									</div>
								);
							})}
						</div>
					</section>

					{/* 로그아웃 */}
					<section className='rounded-xl border border-border bg-card p-4'>
						<button
							onClick={handleLogout}
							className='flex items-center gap-3 w-full text-left text-destructive'
						>
							<div className='w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0'>
								<LogOut className='w-4 h-4 text-destructive' />
							</div>
							<p className='text-sm font-medium'>로그아웃</p>
						</button>
					</section>
				</div>
			</div>
		</AppLayout>
	);
}
