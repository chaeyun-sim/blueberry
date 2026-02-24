import { supabase } from '@/lib/supabase'
import { CommissionStatus } from '@/constants/status-config'
import { Commission, CreateCommissionInput, UpdateCommissionInput } from '@/types/commission'

// 의뢰 목록 조회
export async function getCommissions() {
  const { data, error } = await supabase
    .from('commissions')
    .select('*, songs(title, composer, category)')
    .order('deadline', { ascending: true })

  if (error) throw error
  return data as Commission[]
}

// 의뢰 상세 조회
export async function getCommission(id: string) {
  const { data, error } = await supabase
    .from('commissions')
    .select('*, songs(title, composer, category)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Commission
}

// 의뢰 등록
export async function createCommission(input: CreateCommissionInput) {
  const { data, error } = await supabase
    .from('commissions')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Commission
}

// 의뢰 정보 수정
export async function updateCommission(id: string, input: UpdateCommissionInput) {
  const { data, error } = await supabase
    .from('commissions')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Commission
}

// 의뢰 삭제
export async function deleteCommission(id: string) {
  const { error } = await supabase
    .from('commissions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// 올해 1월부터 현재 달까지 월별 의뢰 접수 건수
export async function getMonthlyCommissionCounts(): Promise<{ month: string; count: number }[]> {
  const now = new Date()
  const year = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const { data, error } = await supabase
    .from('commissions')
    .select('created_at')
    .gte('created_at', `${year}-01-01`)
    .lt('created_at', `${year + 1}-01-01`)

  if (error) throw error

  const countMap = new Map<number, number>()
  for (let m = 1; m <= 12; m++) countMap.set(m, 0)

  for (const row of (data ?? [])) {
    const m = new Date(row.created_at).getMonth() + 1
    if (countMap.has(m)) countMap.set(m, (countMap.get(m) ?? 0) + 1)
  }

  return Array.from(countMap.entries()).map(([m, count]) => ({
    month: `${m}월`,
    count,
  }))
}

// 의뢰 AI 분석
export async function analyzeCommissionImage(imageBase64: string, mediaType: string) {
  const { data, error } = await supabase.functions.invoke('analyze-commission', {
    body: { imageBase64, mediaType },
  })

  if (error) throw error
  return data as {
    songTitle: string | null
    composer: string | null
    instruments: string[]
    version: 'easy' | 'hard' | 'pro' | null
    deadline: string | null
    notes: string | null
  }
}

// 의뢰 이미지 업로드
export async function uploadCommissionImage(commissionId: string, file: File) {
  const ext = file.name.split('.').pop()
  const path = `${commissionId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('commission-images')
    .upload(path, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('commission-images')
    .getPublicUrl(path)

  const { data, error } = await supabase
    .from('commissions')
    .update({ image_url: publicUrl })
    .eq('id', commissionId)
    .select()
    .single()

  if (error) throw error
  return data as Commission
}

// 의뢰 상태 변경
export async function updateCommissionStatus(id: string, status: CommissionStatus) {
  const { data, error } = await supabase
    .from('commissions')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Commission
}
