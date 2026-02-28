import { supabase } from '@/lib/supabase'
import { MusicRecommendation } from '@/mock/recommendations'

// DB row(snake_case) → 프론트 타입(camelCase) 변환
function toRec(row: Record<string, unknown>): MusicRecommendation {
  return {
    id: row.id as string,
    title: row.title as string,
    englishTitle: row.english_title as string,
    composer: row.composer as string,
    category: row.category as MusicRecommendation['category'],
    mood: row.mood as string[],
    description: row.description as string,
    difficulty: row.difficulty as MusicRecommendation['difficulty'],
    youtubeQuery: row.youtube_query as string,
  }
}

// 오늘의 추천곡 (KST 기준)
export async function getTodayRecommendation(): Promise<MusicRecommendation | null> {
  const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('recommended_date', kstDate)
    .maybeSingle()

  if (error) throw error
  return data ? toRec(data) : null
}

// 최근 추천곡 목록
export async function getRecentRecommendations(
  limit: number,
): Promise<Array<{ date: string; rec: MusicRecommendation }>> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .order('recommended_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map((row) => ({
    date: row.recommended_date as string,
    rec: toRec(row),
  }))
}

// 전체 추천곡 (사이드패널 검색용)
export async function getAllRecommendations(): Promise<MusicRecommendation[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .order('recommended_date', { ascending: false })

  if (error) throw error
  return (data ?? []).map(toRec)
}

// 작업 완료한 추천곡 ID 목록
export async function getWorkedSongIds(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('worked_songs')
    .select('recommendation_id')

  if (error) throw error
  return new Set((data ?? []).map((row) => row.recommendation_id as string))
}

// 작업완료 표시
export async function markAsWorked(recommendationId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const { error } = await supabase
    .from('worked_songs')
    .insert({ user_id: user.id, recommendation_id: recommendationId })

  if (error) throw error
}

// 작업완료 취소
export async function unmarkAsWorked(recommendationId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const { error } = await supabase
    .from('worked_songs')
    .delete()
    .eq('user_id', user.id)
    .eq('recommendation_id', recommendationId)

  if (error) throw error
}
