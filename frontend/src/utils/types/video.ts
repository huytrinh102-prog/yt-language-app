export type UserLanguage = {
  id: number;
  userId: number;
  name: string;
  code?: string;
  description?: string;
  color?: string;
  videos?: { id: number }[];
};

export type LanguagePayload = {
  name: string;
  code?: string;
  description?: string;
  color?: string;
};

export type VideoItem = {
  id: number;
  languageId: number;
  youtubeVideoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
  durationSeconds: number;
  language?: string;
  createdAt?: string;
  languageFolder?: UserLanguage;
  transcripts?: TranscriptItem[];
  notes?: NoteItem[];
  vocabularyItems?: VocabularyItem[];
  progress?: VideoProgressItem[];
};

export type VideoPayload = {
  languageId: number;
  youtubeVideoId: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
  durationSeconds?: number;
  language?: string;
};

export type VideosListData = {
  videos: VideoItem[];
  totalRows: number;
  totalPages: number;
};

export type YoutubeMetadata = {
  youtubeVideoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  durationSeconds: number;
  language: string;
};

export type TranscriptSegment = {
  start: number;
  duration: number;
  text: string;
};

export type TranscriptItem = {
  id: number;
  videoId: number;
  language?: string;
  source?: string;
  segments?: TranscriptSegment[] | string;
  rawText?: string;
  createdAt?: string;
};

export type ManualTranscriptPayload = {
  language?: string;
  rawText: string;
  segments?: TranscriptSegment[];
};

export type NoteItem = {
  id: number;
  userId: number;
  videoId: number;
  timeSec: number;
  content: string;
  createdAt?: string;
  video?: {
    id: number;
    youtubeVideoId: string;
    title?: string;
    thumbnailUrl?: string;
    channelTitle?: string;
    durationSeconds?: number;
    language?: string;
    languageId?: number;
    languageFolder?: UserLanguage;
  };
};

export type NotePayload = {
  content: string;
  timeSec: number;
};

export type NotesListData = {
  notes: NoteItem[];
  totalRows: number;
  totalPages: number;
};

export type VocabularyItem = {
  id: number;
  userId: number;
  videoId?: number;
  word: string;
  meaning?: string;
  example?: string;
  language?: string;
  status: string;
  reviewAt?: string;
  timesReviewed: number;
  createdAt?: string;
  video?: {
    id: number;
    youtubeVideoId: string;
    title?: string;
    thumbnailUrl?: string;
    channelTitle?: string;
    durationSeconds?: number;
    language?: string;
    languageId?: number;
    languageFolder?: UserLanguage;
  };
};

export type VocabularyPayload = {
  word: string;
  meaning?: string;
  example?: string;
  language?: string;
  status?: string;
  reviewAt?: string | null;
  timesReviewed?: number;
};

export type VocabularyListData = {
  vocabulary: VocabularyItem[];
  totalRows: number;
  totalPages: number;
};

export type VideoProgressItem = {
  id: number;
  userId: number;
  videoId: number;
  watchedSeconds: number;
  completed: boolean;
  lastWatchedAt?: string;
};

export type VideoProgressPayload = {
  watchedSeconds: number;
  completed?: boolean;
  durationSeconds?: number;
};
