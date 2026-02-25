import { supabase } from '@/lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_KEY

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export async function createPushSubscription() {
  if (!VAPID_PUBLIC_KEY) throw new Error('VITE_VAPID_KEY 환경 변수가 설정되지 않았습니다.')
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('이 브라우저는 푸시 알림을 지원하지 않습니다.')
  }

  const reg = await navigator.serviceWorker.ready

  const existing = await reg.pushManager.getSubscription()
  const sub = existing ?? await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { error } = await supabase.from('push_subscriptions').upsert(
      { user_id: user.id, subscription: sub.toJSON() },
      { onConflict: 'user_id' },
    )
    if (error) throw new Error(`구독 정보 저장에 실패했습니다: ${error.message}`)
  }

  return sub
}
