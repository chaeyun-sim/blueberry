import webpush from "npm:web-push@3.6.6"
import { createClient } from "npm:@supabase/supabase-js@2"

const publicKey = Deno.env.get("VAPID_PUBLIC_KEY")!
const privateKey = Deno.env.get("VAPID_PRIVATE_KEY")!
const email = Deno.env.get("VAPID_EMAIL")!

webpush.setVapidDetails(
  email.startsWith('mailto:') || email.startsWith('https:') ? email : `mailto:${email}`,
  publicKey,
  privateKey,
)

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)

const CRON_SECRET = Deno.env.get("CRON_SECRET")

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization")
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  // body에서 days 배열 받기 (없으면 기본값 [0, 1, 2])
  let days: number[] = [0, 1, 2]
  try {
    const body = await req.json()
    if (Array.isArray(body?.days)) days = body.days
  } catch { /* body 없으면 기본값 사용 */ }

  // 한국 시간(UTC+9) 기준 날짜 계산
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const targets = days.map((d) => {
    const date = new Date(now)
    date.setUTCDate(date.getUTCDate() + d)
    return date.toISOString().split('T')[0]
  })

  const [{ data: commissions }, { data: subscriptions }] = await Promise.all([
    supabase
      .from('commissions')
      .select('id, title, composer, deadline, songs(title)')
      .in('deadline', targets)
      .neq('status', 'complete'),
    supabase
      .from('push_subscriptions')
      .select('subscription'),
  ])

  if (!commissions?.length || !subscriptions?.length) {
    return new Response("no notifications to send", { status: 200 })
  }

  const results = []

  for (const commission of commissions) {
    const daysUntil = targets.indexOf(commission.deadline)
    const songTitle = commission.songs?.title ?? commission.title ?? commission.composer ?? '의뢰'
    const body = daysUntil === 0
      ? '오늘이 마감일이에요!'
      : `${daysUntil}일 후가 마감일이에요`

    for (const { subscription } of subscriptions) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({ title: `🎵 ${songTitle}`, body }),
        )
        results.push({ commission: commission.id, status: 'sent' })
      } catch (e) {
        results.push({ commission: commission.id, status: 'failed', error: String(e) })
      }
    }
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
