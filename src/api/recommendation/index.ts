import { supabase } from '@/lib/supabase';
import { MusicRecommendation } from '@/mock/recommendations';

const RECOMMENDATIONS = 'recommendations';
const WORKED_SONGS = 'worked_songs';
const RECOMMENDED_DATE = 'recommended_date';
const RECOMMENDATION_ID = 'recommendation_id';

// 오늘의 추천곡 (KST 기준)
export async function getTodayRecommendation(): Promise<MusicRecommendation | null> {
  const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from(RECOMMENDATIONS)
    .select('*')
    .eq(RECOMMENDED_DATE, kstDate)
    .maybeSingle();

  if (error) throw error;
  return data
    ? {
        ...data,
        englishTitle: data.english_title,
        youtubeQuery: data.youtube_query,
      }
    : null;
}

// 최근 추천곡 목록
export async function getRecentRecommendations(
  limit: number,
): Promise<Array<{ date: string; rec: MusicRecommendation }>> {
  const { data, error } = await supabase
    .from(RECOMMENDATIONS)
    .select('*')
    .order(RECOMMENDED_DATE, { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(row => ({
    date: row.recommended_date as string,
    rec: {
      ...row,
      englishTitle: row.english_title,
      youtubeQuery: row.youtube_query,
    },
  }));
}

// 전체 추천곡 (사이드패널 검색용)
export async function getAllRecommendations(): Promise<MusicRecommendation[]> {
  const { data, error } = await supabase
    .from(RECOMMENDATIONS)
    .select('*')
    .order(RECOMMENDED_DATE, { ascending: false });

  if (error) throw error;
  return (data ?? []).map(row => ({
    ...row,
    englishTitle: row.english_title,
    youtubeQuery: row.youtube_query,
  }));
}

// 작업 완료한 추천곡 ID 목록
export async function getWorkedSongIds(): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요');

  const { data, error } = await supabase.from(WORKED_SONGS).select(RECOMMENDATION_ID).eq('user_id', user.id);

  if (error) throw error;
  return new Set((data ?? []).map(row => row[RECOMMENDATION_ID] as string));
}

// 작업완료 표시
export async function markAsWorked(recommendationId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요해요');

  const { error } = await supabase
    .from(WORKED_SONGS)
    .insert({ user_id: user.id, [RECOMMENDATION_ID]: recommendationId });

  if (error) throw error;
}

// 작업완료 취소
export async function unmarkAsWorked(recommendationId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요해요');

  const { error } = await supabase
    .from(WORKED_SONGS)
    .delete()
    .eq('user_id', user.id)
    .eq(RECOMMENDATION_ID, recommendationId);

  if (error) throw error;
}
