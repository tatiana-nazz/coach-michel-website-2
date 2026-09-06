import type { SupportedLocale } from '@/i18n/config';

export interface TraineeExercise {
  ref: string;
  order: number;
  title: string;
  description: string;
  instructions: string[];
  sets: string;
  reps: string;
  rest: string;
  contentLocale: SupportedLocale;
  available: boolean;
}

export interface TraineeSession {
  scheduleRef: string;
  sessionRef: string;
  versionRef: string;
  title: string;
  description: string;
  scheduledFor: string | null;
  status: string;
  released: boolean;
  exercises: TraineeExercise[];
  completionRef: string | null;
  intentRef: string | null;
  intentStatus: string | null;
}

export interface TraineeCompletion {
  ref: string;
  scheduleRef: string;
  completedAt: string;
  version: number;
}

export interface TraineeSupportCase {
  ref: string;
  category: string;
  status: string;
  createdAt: string;
}

export interface TraineeWorkspaceData {
  displayName: string;
  accountRef: string;
  profileStatus: string;
  savedLocale: SupportedLocale;
  sessions: TraineeSession[];
  completions: TraineeCompletion[];
  supportCases: TraineeSupportCase[];
}

export interface CompletionResponse {
  intentRef: string;
  status: string;
  completionRef?: string;
}

export interface SupportResponse {
  caseRef: string;
  status: string;
}
