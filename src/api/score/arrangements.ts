import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '@/constants/file-types';
import { supabase } from '@/lib/supabase';
import { Arrangement, ArrangementFile, CreateArrangementInput } from '@/types/score';

const ARRANGEMENTS = 'arrangements';
const ARRANGEMENT_FILES_TABLE = 'arrangement_files';
const ARRANGEMENT_FILES_BUCKET = 'arrangement-files';
const ARRANGEMENT_SELECT = `*, ${ARRANGEMENT_FILES_TABLE}(*), songs(title, composer, english_title)`;

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

export async function createArrangement(input: CreateArrangementInput) {
  const { data, error } = await supabase.from(ARRANGEMENTS).insert(input).select().single();
  if (error) throw error;
  return data as Arrangement;
}

export async function deleteArrangement(id: string) {
  const { error } = await supabase
    .from(ARRANGEMENTS)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

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

export async function uploadArrangementFile(arrangementId: string, file: File, label: string) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (!ext) throw new Error('파일 확장자를 찾을 수 없습니다.');
  if (!ALLOWED_EXTENSIONS.includes(ext)) throw new Error(`허용되지 않는 파일 형식입니다: .${ext}`);
  if (file.size > MAX_FILE_SIZE) throw new Error(`파일 크기가 50MB를 초과합니다: ${file.name}`);

  const safeName = label.replace(/[,\s]+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${arrangementId}/${safeName}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(ARRANGEMENT_FILES_BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(ARRANGEMENT_FILES_BUCKET)
    .getPublicUrl(path);

  return publicUrl;
}

export async function deleteArrangementFile(id: string) {
  const { data, error: fetchError } = await supabase
    .from(ARRANGEMENT_FILES_TABLE)
    .select('url')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const path = data.url.split(`/${ARRANGEMENT_FILES_BUCKET}/`)[1];
  if (!path) throw new Error(`Storage 경로를 추출할 수 없습니다: ${data.url}`);

  const { error: storageError } = await supabase.storage
    .from(ARRANGEMENT_FILES_BUCKET)
    .remove([path]);

  if (storageError) throw storageError;

  const { error } = await supabase.from(ARRANGEMENT_FILES_TABLE).delete().eq('id', id);
  if (error) throw error;
}
