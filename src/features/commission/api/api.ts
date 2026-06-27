import dayjs from 'dayjs'
import { CommissionStatus } from '@/constants/status-config'
import { supabase } from '@/lib/supabase'
import { AnalyzeImageType, Commission, CommissionCategory, CreateCommissionInput, UpdateCommissionInput } from '../types'

const COMMISSIONS = 'commissions'
const COMMISSION_LIST_SELECT = '*, songs(title, composer), commission_categories(id, name)'
const COMMISSION_DETAIL_SELECT = '*, songs(title, composer), commission_categories(id, name)'
const COMMISSION_IMAGES = 'commission-images'
const CATEGORIES = 'commission_categories'

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
  const year = dayjs().year()

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

/**
 * Thrown when `updateCommissionStatus` detects that the commission's status
 * was already changed by another session (PGRST116 / optimistic concurrency).
 * Callers can `instanceof`-check this to skip retries.
 */
export class ConcurrencyConflictError extends Error {
  constructor() {
    super('다른 기기에서 이미 상태가 변경되었습니다. 페이지를 새로고침해주세요.');
    this.name = 'ConcurrencyConflictError';
  }
}

// @MX:ANCHOR: [AUTO] Status transition entry point — called from CommissionDetail and CommissionEdit.
// @MX:REASON: Optimistic concurrency guard: prevStatus must match the DB row's current status or
//             PGRST116 is returned (0 rows updated). Any caller change to this signature must be
//             reflected in both CommissionDetail.tsx and CommissionEdit.tsx.
// 의뢰 상태 변경
export async function updateCommissionStatus(
  id: string,
  status: CommissionStatus,
  prevStatus: CommissionStatus,
) {
  const { data, error } = await supabase
    .from(COMMISSIONS)
    .update({ status })
    .eq('id', id)
    .eq('status', prevStatus)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') throw new ConcurrencyConflictError();
    throw error
  }
  return data as Commission
}

// 카테고리 목록 조회
export async function getCategories(): Promise<CommissionCategory[]> {
  const { data, error } = await supabase
    .from(CATEGORIES)
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as CommissionCategory[]
}

// 카테고리 추가
export async function createCategory(name: string): Promise<CommissionCategory> {
  const { data, error } = await supabase
    .from(CATEGORIES)
    .insert({ name })
    .select()
    .single()

  if (error) throw error
  return data as CommissionCategory
}

// 카테고리 수정
export async function updateCategory(id: string, name: string): Promise<CommissionCategory> {
  const { data, error } = await supabase
    .from(CATEGORIES)
    .update({ name })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as CommissionCategory
}

// 카테고리 삭제
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from(CATEGORIES)
    .delete()
    .eq('id', id)

  if (error) throw error
}
