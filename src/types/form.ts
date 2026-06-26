import { CommissionStatus } from '@/constants/status-config';
import { DifficultyLevelType } from './commission';

export interface CommissionRegisterFormType {
  imagePreview: string | null;
  instruments: string[];
  songTitle: string;
  composer: string;
  version: DifficultyLevelType | null;
  deadline: string;
  notes?: string;
  imageFile: File | null;
}

export interface FileEntry {
  file: File;
  label: string;
  fileType: string;
}

export interface EditFormType {
  title: string;
  composer: string;
  instruments: string[];
  version: DifficultyLevelType;
  deadline: string;
  notes: string;
  status: CommissionStatus;
}