export type UserRole = 'admin' | 'member';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRole;
  isCustomAdmin?: boolean;
}

export type FamilyCategory = 'inti' | 'kakek_nenek' | 'kerabat' | 'pernikahan';

export interface VocabularyItem {
  id: string;
  arabic: string;
  transliteration: string;
  indonesian: string;
  category: FamilyCategory;
  gender: 'mudzakkar' | 'muannats';
  exampleArabic: string;
  exampleTranslation: string;
  note?: string;
  icon?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface UserProgress {
  userId: string;
  completedVocabIds: string[];
  quizScores: {
    date: string;
    score: number;
    total: number;
  }[];
  totalQuizzesTaken: number;
  highestScore: number;
  lastActive: string;
}

export interface SentenceAnalysis {
  isCorrect: boolean;
  original: string;
  corrected: string;
  translation: string;
  feedback: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  createdAt: string;
}
