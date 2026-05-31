import { supabase } from '@/lib/supabase';
import { CreateSongInput, Song, UpdateSongInput } from '@/types/score';

const SONGS = 'songs';
const SONGS_LIST_SELECT = '*, arrangements(*)';

export async function findSongByTitle(title: string, composer: string) {
  const { data, error } = await supabase
    .from(SONGS)
    .select('id, title, composer')
    .ilike('title', title)
    .ilike('composer', composer)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Pick<Song, 'id' | 'title' | 'composer'> | null;
}

export async function getSongs() {
  const { data, error } = await supabase
    .from(SONGS)
    .select(SONGS_LIST_SELECT)
    .is('deleted_at', null)
    .order('composer', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data as Song[]).map(song => ({
    ...song,
    arrangements: song.arrangements?.filter(a => !a.deleted_at) ?? [],
  }));
}

export async function getSongsSummary() {
  const { data, error } = await supabase
    .from(SONGS)
    .select('id, arrangements(id, deleted_at)')
    .is('deleted_at', null);

  if (error) throw error;
  return (data ?? []).map(song => ({
    id: song.id,
    arrangements: Array.isArray(song.arrangements)
      ? (song.arrangements as { id: string; deleted_at: string | null }[]).filter(a => !a.deleted_at)
      : [],
  }));
}

export async function getSong(id: string) {
  const { data, error } = await supabase
    .from(SONGS)
    .select(SONGS_LIST_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  const song = data as Song;
  if (song?.arrangements) {
    song.arrangements = song.arrangements.filter(a => !a.deleted_at);
  }
  return song;
}

export async function createSong(input: CreateSongInput) {
  const { data, error } = await supabase.from(SONGS).insert(input).select().single();

  if (error) {
    if (error.code === '23505') {
      const { data: existing, error: fetchError } = await supabase
        .from(SONGS)
        .select()
        .ilike('title', input.title)
        .ilike('composer', input.composer)
        .limit(1)
        .single();

      if (fetchError) throw fetchError;
      if (!existing) throw error;

      if (existing.deleted_at) {
        const { data: restored, error: restoreError } = await supabase
          .from(SONGS)
          .update({ deleted_at: null })
          .eq('id', existing.id)
          .select()
          .single();
        if (restoreError) throw restoreError;
        return restored as Song;
      }

      return existing as Song;
    }
    throw error;
  }

  return data as Song;
}

export async function updateSong(id: string, input: UpdateSongInput) {
  const { data, error } = await supabase.from(SONGS).update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as Song;
}

export async function deleteSong(id: string) {
  const { error } = await supabase
    .from(SONGS)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
