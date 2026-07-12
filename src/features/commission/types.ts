import { CommissionStatus } from '@/constants/status-config';

export type DifficultyLevelType = "hard" | "easy" | "pro" | null;

export type CommissionCategory = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

export type Commission = {
  id: string;
  song_id: string | null;
  title: string | null;
  composer: string | null;
  arrangement: string;
  version: DifficultyLevelType;
  deadline: string;
  status: CommissionStatus;
  is_delivered: boolean;
  notes: string | null;
  image_url: string | null;
  category_id: string | null;
  created_at: string;
  songs: {
    title: string;
    composer: string;
    category: string | null;
  } | null;
  commission_categories: {
    id: string;
    name: string;
  } | null;
};

export type CreateCommissionInput = {
  song_id?: string;
  title?: string;
  composer?: string;
  arrangement: string;
  version?: DifficultyLevelType;
  deadline: string;
  notes?: string;
  category_id?: string | null;
};

export type UpdateCommissionInput = {
  title?: string;
  composer?: string;
  arrangement?: string;
  version?: DifficultyLevelType;
  deadline?: string;
  notes?: string;
  status?: CommissionStatus;
  is_delivered?: boolean;
  image_url?: string | null;
  category_id?: string | null;
};

export const COMMISSION_INFO = {
  category: '카테고리',
  composer: '작곡가',
  arrangement: '편성',
  version: '버전',
  created_at: '등록일',
  deadline: '마감일',
};

export interface AnalyzeImageType {
  songTitle: string;
  composer: string;
  instruments: string[];
  version?: DifficultyLevelType;
  deadline: string;
  notes?: string;
}
