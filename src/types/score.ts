export type ArrangementFile = {
  id: string
  arrangement_id: string
  label: string
  file_type: string
  url: string
  created_at: string
}

export type Arrangement = {
  id: string
  song_id: string
  arrangement: string
  version: string | null
  commission_id: string | null
  created_at: string
  deleted_at?: string | null
  arrangement_files?: ArrangementFile[]
  songs?: { title: string; composer: string; english_title: string | null } | null
}

export type Song = {
  id: string
  title: string
  english_title: string | null
  composer: string
  category_id: string | null
  created_at: string
  deleted_at?: string | null
  categories: { name: string } | null
  arrangements: Arrangement[]
}

export type CreateSongInput = {
  title: string
  english_title?: string
  composer: string
  category_id?: string
}

export type UpdateSongInput = {
  title?: string
  english_title?: string
  composer?: string
  category_id?: string
}

export type CreateArrangementInput = {
  song_id: string
  arrangement: string
  version?: string | null
  commission_id?: string | null
}
