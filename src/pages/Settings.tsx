import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/use-auth';
import { logout } from '@/api/auth';
import { createPushSubscription, pushQueries } from '@/hooks/use-push';
import { supabase } from '@/lib/supabase';
import { Switch } from '@/components/ui/switch';
import { Bell, LogOut } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import logoImg from '@/assets/logo.webp';
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from 'sonner';
import AppHeader from '@/components/layout/AppHeader';

export default function Settings() {
  const { session, isGuest } = useAuth();
  const navigate = useNavigate();

  const { data: pushEnabled = false, refetch: refetchPush } = useQuery(
    pushQueries.hasPushSubscription(session?.user?.id),
  );
  const [pushLoading, setPushLoading] = useState(false);

  const handlePushToggle = async (checked: boolean) => {
    if (isGuest || !session?.access_token) {
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
        await supabase.from('push_subscriptions').delete().eq('user_id', session.user.id);
        await refetchPush();
        toast.success('푸시 알림이 비활성화됐어요');
      }
    } catch (e) {
      toast.error('알림 설정에 실패했어요', { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setPushLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout().catch(() => {});
    navigate('/login');
  };

  if (isGuest) return <Navigate to='/not-found' replace />;

  return (
    <AppLayout>
      <AppHeader>
        <AppHeader.Back />
      </AppHeader>
      <div className="max-w-lg mx-auto">
        <PageHeader title='설정' />

        <div className="flex flex-col gap-3 mt-6">
          {/* 프로필 */}
          <section className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground font-medium mb-3">계정</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <img src={logoImg} alt="로고" className="w-5 h-5 object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.email}</p>
                <p className="text-xs text-muted-foreground">BlueBerry 계정</p>
              </div>
            </div>
          </section>

          {/* 알림 */}
          <section className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground font-medium mb-3">알림</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">마감일 푸시 알림</p>
                <p className="text-xs text-muted-foreground">당일·1일·2일 전 자동 알림</p>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={handlePushToggle} disabled={pushLoading} aria-label='마감일 푸시 알림 토글' />
            </div>
          </section>

          {/* 로그아웃 */}
          <section className="rounded-xl border border-border bg-card p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full text-left text-destructive"
            >
              <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4 text-destructive" />
              </div>
              <p className="text-sm font-medium">로그아웃</p>
            </button>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
