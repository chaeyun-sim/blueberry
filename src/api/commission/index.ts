import { supabase } from '@/lib/supabase'
import { CommissionStatus } from '@/constants/status-config'
import { AnalyzeImageType, Commission, CreateCommissionInput, UpdateCommissionInput } from '@/types/commission'

const COMMISSIONS = 'commissions'
const COMMISSION_LIST_SELECT = '*, songs(title, composer)'
const COMMISSION_DETAIL_SELECT = '*, songs(title, composer)'
const COMMISSION_IMAGES = 'commission-images'

// 의뢰 목록 조회
export async function getCommissions() {
  const { data, error } = await supabase
    .from(COMMISSIONS)
    .select(COMMISSION_LIST_SELECT)
    .order('deadline', { ascending: true })

  if (error) throw error
  return data as Commission[]
}

// 의뢰 상세 조회
export async function getCommission(id: string) {
  const { data, error } = await supabase
    .from(COMMISSIONS)
    .select(COMMISSION_DETAIL_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Commission
}

// 의뢰 등록
export async function createCommission(input: CreateCommissionInput) {
  const { data, error } = await supabase
    .from(COMMISSIONS)
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Commission
}

// 의뢰 정보 수정
export async function updateCommission(id: string, input: UpdateCommissionInput): Promise<Commission> {
  const { data, error } = await supabase
    .from(COMMISSIONS)
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
    .from(COMMISSIONS)
    .delete()
    .eq('id', id)

  if (error) throw error
}

// 올해 1~12월 월별 의뢰 접수 건수 (미래 달은 0으로 반환)
export async function getMonthlyCommissionCounts(): Promise<{ month: string; count: number }[]> {
  const year = new Date().getFullYear()

  const { data, error } = await supabase
    .from(COMMISSIONS)
    .select('created_at')
    .gte('created_at', `${year}-01-01`)
    .lt('created_at', `${year + 1}-01-01`)

  if (error) throw error

  const countMap = new Map<number, number>()
  for (let m = 1; m <= 12; m++) countMap.set(m, 0)

  for (const row of (data ?? [])) {
    const m = new Date(row.created_at).getUTCMonth() + 1
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
  return data as AnalyzeImageType
}

// 의뢰 이미지 업로드 (Storage만 담당, URL 반환)
export async function uploadCommissionImage(commissionId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()

  if (!ext) throw new Error('파일 확장자를 찾을 수 없습니다.')

  const path = `${commissionId}.${ext}`

  const { error } = await supabase.storage
    .from(COMMISSION_IMAGES)
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(COMMISSION_IMAGES)
    .getPublicUrl(path)

  return publicUrl
}

// 의뢰 상태 변경
export async function updateCommissionStatus(id: string, status: CommissionStatus) {
  const { data, error } = await supabase
    .from(COMMISSIONS)
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Commission
}
