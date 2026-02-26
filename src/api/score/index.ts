import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '@/constants/file-types';
import { supabase } from '@/lib/supabase';
import {
  Arrangement,
  ArrangementFile,
  CreateArrangementInput,
  CreateSongInput,
  Song,
  UpdateSongInput,
} from '@/types/score';

const SONGS = 'songs';
const SONGS_LIST_SELECT = '*, arrangements(*)';
const ARRANGEMENTS = 'arrangements';
const ARRANGEMENT_FILES_TABLE = 'arrangement_files';
const ARRANGEMENT_FILES_BUCKET = 'arrangement-files';
const ARRANGEMENT_SELECT = `*, ${ARRANGEMENT_FILES_TABLE}(*), songs(title, composer, english_title)`;

// 곡명으로 song 검색
export async function findSongByTitle(title: string) {
  const { data, error } = await supabase
    .from(SONGS)
    .select('id, title, composer')
    .ilike('title', title)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  return data as Pick<Song, 'id' | 'title' | 'composer'> | null;
}

// 악보 목록 조회 (songs + arrangements)
export async function getSongs() {
  const { data, error } = await supabase
    .from(SONGS)
    .select(SONGS_LIST_SELECT)
    .is('deleted_at', null)
    .is('arrangements.deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Song[];
}

// 악보 상세 조회 (song + arrangements)
export async function getSong(id: string) {
  const { data, error } = await supabase
    .from(SONGS)
    .select(SONGS_LIST_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .is('arrangements.deleted_at', null)
    .single();

  if (error) throw error;
  return data as Song;
}

// 편성 상세 조회 (arrangement + files + song)
export async function getArrangement(arrangementId: string) {
  const { data, error } = await supabase
    .from(ARRANGEMENTS)
    .select(ARRANGEMENT_SELECT)
    .eq('id', arrangementId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data as Arrangement;
}

// 악보 등록 (insert or return existing — title unique 제약 기반)
export async function createSong(input: CreateSongInput) {
  const { data, error } = await supabase
    .from(SONGS)
    .upsert(input, { onConflict: 'title', ignoreDuplicates: true })
    .select()
    .maybeSingle();

  if (error) throw error;

  // race condition으로 insert가 무시된 경우 기존 row 반환
  if (!data) {
    const { data: existing, error: fetchError } = await supabase
      .from(SONGS)
      .select()
      .eq('title', input.title)
      .is('deleted_at', null)
      .single();

    if (fetchError) throw fetchError;
    return existing as Song;
  }

  return data as Song;
}

// 악보 정보 수정
export async function updateSong(id: string, input: UpdateSongInput) {
  const { data, error } = await supabase.from(SONGS).update(input).eq('id', id).select().single();

  if (error) throw error;
  return data as Song;
}

// 악보 삭제 (soft delete)
export async function deleteSong(id: string) {
  const { error } = await supabase
    .from(SONGS)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// 편성 등록
export async function createArrangement(input: CreateArrangementInput) {
  const { data, error } = await supabase.from(ARRANGEMENTS).insert(input).select().single();

  if (error) throw error;
  return data as Arrangement;
}

// 악보 파일 등록
export async function createArrangementFile(
  arrangementId: string,
  label: string,
  fileType: string,
  url: string,
): Promise<ArrangementFile> {
  const { data, error } = await supabase
    .from(ARRANGEMENT_FILES_TABLE)
    .insert({ arrangement_id: arrangementId, label, file_type: fileType, url })
    .select()
    .single();

  if (error) throw error;
  return data as ArrangementFile;
}

// 편성 삭제 (soft delete)
export async function deleteArrangement(id: string) {
  const { error } = await supabase
    .from(ARRANGEMENTS)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// 악보 파일 업로드
export async function uploadArrangementFile(arrangementId: string, file: File, label: string) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (!ext) throw new Error('파일 확장자를 찾을 수 없습니다.');
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`허용되지 않는 파일 형식입니다: .${ext}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`파일 크기가 50MB를 초과합니다: ${file.name}`);
  }

  const safeName = label.replace(/[,\s]+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_');

  const path = `${arrangementId}/${safeName}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(ARRANGEMENT_FILES_BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(ARRANGEMENT_FILES_BUCKET).getPublicUrl(path);

  return publicUrl;
}

// 악보 파일 삭제 (hard delete - storage도 함께 삭제하므로 복구 불가)
export async function deleteArrangementFile(id: string) {
  // path 추출 용 URL 추적
  const { data, error: fetchError } = await supabase
    .from(ARRANGEMENT_FILES_TABLE)
    .select('url')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // path 추출
  const path = data.url.split(`/${ARRANGEMENT_FILES_BUCKET}/`)[1];

  if (!path) throw new Error(`Storage 경로를 추출할 수 없습니다: ${data.url}`);

  // storage 먼저 삭제
  const { error: storageError } = await supabase.storage
    .from(ARRANGEMENT_FILES_BUCKET)
    .remove([path]);

  if (storageError) throw storageError;

  // 파일 테이블 삭제
  const { error } = await supabase.from(ARRANGEMENT_FILES_TABLE).delete().eq('id', id);

  if (error) throw error;
}
