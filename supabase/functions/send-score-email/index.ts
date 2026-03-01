import JSZip from 'npm:jszip'
import { createClient } from 'npm:@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function requireEnv(key: string): string {
  const value = Deno.env.get(key)
  if (!value) throw new Error(`환경변수 누락: ${key}`)
  return value
}

const supabase = createClient(
  requireEnv('SUPABASE_URL'),
  requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
)

const NAVER_EMAIL = requireEnv('NAVER_EMAIL')
const NAVER_PASSWORD = requireEnv('NAVER_PASSWORD')

const transporter = nodemailer.createTransport({
  host: 'smtp.naver.com',
  port: 465,
  secure: true,
  auth: {
    user: NAVER_EMAIL,
    pass: NAVER_PASSWORD,
  },
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // JWT 인증 검증
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: '인증이 필요합니다' }),
      { status: 401, headers: corsHeaders },
    )
  }
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: '유효하지 않은 인증 정보입니다' }),
      { status: 401, headers: corsHeaders },
    )
  }

  try {
    const { commissionId, toEmail } = await req.json()

    if (!commissionId) {
      return new Response(
        JSON.stringify({ error: 'commissionId가 필요해요' }),
        { status: 400, headers: corsHeaders },
      )
    }

    // 1. 의뢰 + 곡 제목 조회
    const { data: commission, error: commErr } = await supabase
      .from('commissions')
      .select('*, songs(title)')
      .eq('id', commissionId)
      .single()

    if (commErr || !commission) {
      return new Response(
        JSON.stringify({ error: '의뢰를 찾을 수 없어요' }),
        { status: 404, headers: corsHeaders },
      )
    }

    const songTitle = commission.songs?.title ?? commission.title ?? '신청곡'

    // 2. arrangement 조회
    const { data: arrangements, error: arrErr } = await supabase
      .from('arrangements')
      .select('id')
      .eq('commission_id', commissionId)

    if (arrErr || !arrangements || arrangements.length === 0) {
      return new Response(
        JSON.stringify({ error: '연결된 악보가 없어요' }),
        { status: 404, headers: corsHeaders },
      )
    }

    const arrangementId = arrangements[0].id

    // 3. arrangement_files 조회
    const { data: files, error: filesErr } = await supabase
      .from('arrangement_files')
      .select('*')
      .eq('arrangement_id', arrangementId)

    if (filesErr || !files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: '첨부할 파일이 없어요' }),
        { status: 404, headers: corsHeaders },
      )
    }

    // 4. 파일 다운로드 + ZIP 빌드
    const zip = new JSZip()
    const usedNames = new Set<string>()

    for (const file of files) {
      const response = await fetch(file.url)
      if (!response.ok) continue

      const buffer = await response.arrayBuffer()
      const ext = file.url.split('.').pop()?.split('?')[0] ?? 'bin'

      let name = `${file.label}.${ext}`
      if (usedNames.has(name)) {
        let i = 2
        while (usedNames.has(`${file.label}_${i}.${ext}`)) i++
        name = `${file.label}_${i}.${ext}`
      }
      usedNames.add(name)
      zip.file(name, buffer)
    }

    const zipUint8 = await zip.generateAsync({ type: 'uint8array' })

    // 5. Naver SMTP로 이메일 발송
    await transporter.sendMail({
      from: `"${Deno.env.get('SENDER_NAME') ?? '심채윤'}" <${NAVER_EMAIL}>`,
      to: toEmail || NAVER_EMAIL,
      subject: `[신청곡] ${songTitle}`,
      text: `안녕하세요, 심채윤입니다!\n${songTitle} 신청곡 보내드립니다.\n이상 있으면 알려주세요!\n감사합니다. :)`,
      attachments: [
        {
          filename: `${songTitle}.zip`,
          content: zipUint8,
          contentType: 'application/zip',
        },
      ],
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: corsHeaders },
    )
  }
})
