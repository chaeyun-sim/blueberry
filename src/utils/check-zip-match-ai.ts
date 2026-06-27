import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function checkZipMatchAI(
  zipName: string,
  songTitle: string,
  composer: string,
  arrangement: string,
  version?: string | null,
): Promise<boolean> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 5,
    messages: [
      {
        role: 'user',
        content: `ZIP 파일명이 아래 의뢰 정보와 같은 곡인지 판단해. 약어·번역·음역어·초성도 일치로 간주해.${version ? ' 버전(easy/hard/pro)이 명시된 경우 파일명에 해당 버전이 포함되어야 일치로 간주해.' : ''} "yes" 또는 "no"로만 답해.

ZIP: ${zipName.replace(/\.zip$/i, '')}
곡명: ${songTitle}
작곡가: ${composer || '없음'}
편성: ${arrangement || '없음'}${version ? `\n버전: ${version}` : ''}`,
      },
    ],
  });

  const text =
    message.content[0].type === 'text' ? message.content[0].text.trim().toLowerCase() : '';

  return text.startsWith('yes');
}
