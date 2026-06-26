import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? process.env.VITE_ANTHROPIC_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { zipName, songTitle, composer, arrangement } = req.body as {
    zipName: string;
    songTitle: string;
    composer: string;
    arrangement: string;
  };

  if (!zipName || !songTitle) {
    return res.status(400).json({ error: 'zipName and songTitle are required' });
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 5,
    messages: [
      {
        role: 'user',
        content: `ZIP 파일명이 아래 의뢰 정보와 같은 곡인지 판단해. 약어·번역·음역어·초성도 일치로 간주해. "yes" 또는 "no"로만 답해.

ZIP: ${zipName.replace(/\.zip$/i, '')}
곡명: ${songTitle}
작곡가: ${composer || '없음'}
편성: ${arrangement || '없음'}`,
      },
    ],
  });

  const text =
    message.content[0].type === 'text' ? message.content[0].text.trim().toLowerCase() : '';

  res.status(200).json({ match: text.startsWith('yes') });
}
