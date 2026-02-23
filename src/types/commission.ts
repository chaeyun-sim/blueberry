import { CommissionStatus } from '@/components/StatusBadge';

export type DifficultyLevelType = "hard" | "easy" | "pro" | null;

export type Commission = {
  id: string
  song_id: string | null
  title: string | null
  composer: string | null
  arrangement: string
  version: DifficultyLevelType
  deadline: string
  status: CommissionStatus
  notes: string | null
  image_url: string | null
  created_at: string
  songs: {
    title: string
    composer: string
    category_id: string | null
  } | null
}

export type CreateCommissionInput = {
  song_id?: string
  title?: string
  composer?: string
  arrangement: string
  version?: DifficultyLevelType
  deadline: string
  notes?: string
}

export type UpdateCommissionInput = {
  composer?: string
  arrangement?: string
  version?: DifficultyLevelType
  deadline?: string
  notes?: string
  status?: CommissionStatus
}