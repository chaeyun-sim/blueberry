import Anthropic from 'npm:@anthropic-ai/sdk'

const client = new Anthropic()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64, mediaType } = await req.json()

    if (!imageBase64 || !mediaType) {
      return new Response(JSON.stringify({ error: 'imageBase64, mediaType은 필수입니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            {
              type: 'text',
              text: `이 이미지는 악보 편곡 의뢰 내용입니다. 이미지에서 아래 정보를 추출해 JSON 형식으로만 응답해주세요. 다른 텍스트는 절대 포함하지 마세요.

{
  "songTitle": "곡명 (없으면 null)",
  "composer": "작곡가. 이미지에 없어도 곡명으로 알 수 있으면 채워줘. 모르면 null",
  "instruments": ["악기1", "악기2"],
  "version": "난이도. easy/hard/pro 중 하나로만 응답. 언급 없으면 null",
  "deadline": "마감일 YYYY-MM-DD 형식 (없으면 null)",
  "notes": "추가 요청사항 (없으면 null)"
}`,
            },
          ],
        },
      ],
    })

    const text = (response.content[0] as { type: string; text: string }).text
    const match = text.match(/\{[\s\S]*\}/)

    if (!match) {
      return new Response(JSON.stringify({ error: '분석 결과를 파싱할 수 없습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = JSON.parse(match[0])

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
