import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'

function requireEnv(key: string): string {
  const value = Deno.env.get(key)
  if (!value) throw new Error(`환경변수 누락: ${key}`)
  return value
}

const anthropic = new Anthropic({ apiKey: requireEnv('ANTHROPIC_API_KEY') })
const supabase = createClient(
  requireEnv('SUPABASE_URL'),
  requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
)

const CRON_SECRET = requireEnv('CRON_SECRET')

Deno.serve(async (req) => {
  // 인증 확인 (cron에서만 호출 가능하게)
  const authHeader = req.headers.get('Authorization')
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 한국 시간(UTC+9) 기준 오늘 날짜
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const todayStr = kstNow.toISOString().split('T')[0] // "2026-02-28"

  // 오늘 이미 추천곡이 있으면 중복 생성 방지
  const { data: existing } = await supabase
    .from('recommendations')
    .select('id')
    .eq('recommended_date', todayStr)
    .maybeSingle()

  if (existing) {
    return new Response(JSON.stringify({ message: '오늘 추천곡이 이미 있어요', date: todayStr }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 최근 30곡 조회 (중복 추천 방지용)
  const { data: recentRecs } = await supabase
    .from('recommendations')
    .select('title, composer')
    .order('recommended_date', { ascending: false })
    .limit(30)

  const recentList = recentRecs?.map((r) => `- ${r.title} (${r.composer})`).join('\n') ?? '없음'

  // Claude에게 추천곡 생성 요청
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `클래식, OST, 애니메이션 음악 중에서 피아노 또는 현악 편곡하기 좋은 곡을 1개 추천해주세요.

최근에 이미 추천한 곡들이니 제외해주세요:
${recentList}

반드시 아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 절대 포함하지 마세요.
{
  "title": "곡 제목 (한국어로 알려진 이름 또는 원어)",
  "english_title": "영문 제목",
  "composer": "작곡가 이름",
  "category": "CLASSIC, OST, ANI, ETC 중 하나",
  "mood": ["분위기 태그1", "분위기 태그2", "분위기 태그3"],
  "description": "이 곡의 특징과 편곡 포인트를 2~3문장으로 설명",
  "difficulty": "쉬움, 보통, 어려움 중 하나",
  "youtube_query": "유튜브에서 원곡을 찾기 좋은 영문 검색어"
}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Claude 응답 형식이 올바르지 않아요')
  }

  // Claude가 ```json ... ``` 형태로 감싸서 줄 때 벗겨내기
  const jsonText = content.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  const rec = JSON.parse(jsonText)

  const { data: inserted, error } = await supabase
    .from('recommendations')
    .insert({
      title: rec.title,
      english_title: rec.english_title,
      composer: rec.composer,
      category: rec.category,
      mood: rec.mood,
      description: rec.description,
      difficulty: rec.difficulty,
      youtube_query: rec.youtube_query,
      recommended_date: todayStr,
    })
    .select()
    .single()

  if (error) throw error

  return new Response(JSON.stringify({ success: true, recommendation: inserted }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
