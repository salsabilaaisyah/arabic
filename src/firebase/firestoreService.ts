import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { UserProgress, ActivityLog } from '../types';

// Default initial progress
const getInitialProgress = (userId: string): UserProgress => ({
  userId,
  completedVocabIds: ['vocab_abun', 'vocab_ummun'], // Initial learned words
  quizScores: [
    {
      date: new Date().toISOString(),
      score: 5,
      total: 5,
    },
  ],
  totalQuizzesTaken: 1,
  highestScore: 100,
  lastActive: new Date().toISOString(),
});

// Cache for offline / fallback
const localProgressCache: Record<string, UserProgress> = {};

// Fetch user learning progress
export async function getUserProgress(userId: string): Promise<UserProgress> {
  const collectionPath = 'user_progress';
  try {
    const docRef = doc(db, collectionPath, userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as UserProgress;
      localProgressCache[userId] = data;
      return data;
    }
  } catch (error) {
    console.warn('Firestore fetch user progress warning:', error);
  }

  if (localProgressCache[userId]) {
    return localProgressCache[userId];
  }

  const initial = getInitialProgress(userId);
  localProgressCache[userId] = initial;
  return initial;
}

// Save or update user learning progress
export async function saveUserProgress(userId: string, progress: Partial<UserProgress>): Promise<void> {
  const collectionPath = 'user_progress';
  const current = localProgressCache[userId] || getInitialProgress(userId);
  const updated: UserProgress = {
    ...current,
    ...progress,
    lastActive: new Date().toISOString(),
  };

  localProgressCache[userId] = updated;

  try {
    const docRef = doc(db, collectionPath, userId);
    await setDoc(docRef, updated, { merge: true });
  } catch (error) {
    console.warn('Firestore save progress warning:', error);
  }
}

// Log activity
export async function logActivity(
  userId: string,
  userEmail: string,
  action: string,
  details: string
): Promise<void> {
  const collectionPath = 'activity_logs';
  const id = 'log_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  const logItem: ActivityLog = { id, userId, userEmail, action, details, createdAt: now };

  try {
    await setDoc(doc(db, collectionPath, id), logItem);
  } catch (error) {
    // silent fallback
  }
}
