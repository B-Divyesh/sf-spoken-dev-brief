export type BriefStatus = 'draft' | 'confirmed';

export interface Reference { path: string; note: string }
export interface Brief {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  transcript: string;
  decisions: string[];
  assumptions: string[];
  questions: string[];
  references: Reference[];
  status: BriefStatus;
  confirmedAt?: string;
}

export interface Settings {
  author: string;
  retentionDays: number;
  deleteAudioAfterTranscription: boolean;
}
