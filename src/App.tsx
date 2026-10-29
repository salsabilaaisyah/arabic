/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { Navbar, MainNavTab } from './components/Navbar';
import { VocabularySection } from './components/VocabularySection';
import { FamilyTreeVisualizer } from './components/FamilyTreeVisualizer';
import { QuizSection } from './components/QuizSection';
import { ArabicTutorChat } from './components/ArabicTutorChat';
import { AdminPanel } from './components/AdminPanel';
import { getUserProgress, saveUserProgress, logActivity } from './firebase/firestoreService';
import { UserProgress } from './types';
import { Sparkles, BookOpen } from 'lucide-react';

function MainLearningApp() {
  const { user, loading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<MainNavTab>('vocab');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  // Load progress when user signs in
  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    try {
      const p = await getUserProgress(user.uid);
      setUserProgress(p);
    } catch (e) {
      console.warn('Progress load warning:', e);
    }
  };

  const handleToggleMastered = async (vocabId: string) => {
    if (!user || !userProgress) return;
    const current = userProgress.completedVocabIds || [];
    const isAlready = current.includes(vocabId);
    const updatedList = isAlready
      ? current.filter((id) => id !== vocabId)
      : [...current, vocabId];

    const updated = {
      ...userProgress,
      completedVocabIds: updatedList,
    };
    setUserProgress(updated);
    await saveUserProgress(user.uid, { completedVocabIds: updatedList });
    await logActivity(
      user.uid,
      user.email || 'siswa@al-usrah.local',
      isAlready ? 'Batal Hafal' : 'Hafal Kosakata',
      `Kosakata: ${vocabId}`
    );
  };

  const handleQuizCompleted = async (score: number, total: number) => {
    if (!user || !userProgress) return;
    const currentScores = userProgress.quizScores || [];
    const newRecord = { date: new Date().toISOString(), score, total };
    const updatedList = [newRecord, ...currentScores.slice(0, 9)];
    const percent = Math.round((score / total) * 100);
    const highest = Math.max(userProgress.highestScore || 0, percent);

    const updated = {
      ...userProgress,
      quizScores: updatedList,
      totalQuizzesTaken: (userProgress.totalQuizzesTaken || 0) + 1,
      highestScore: highest,
    };
    setUserProgress(updated);
    await saveUserProgress(user.uid, {
      quizScores: updatedList,
      totalQuizzesTaken: updated.totalQuizzesTaken,
      highestScore: highest,
    });
    await logActivity(
      user.uid,
      user.email || 'siswa@al-usrah.local',
      'Menyelesaikan Kuis',
      `Skor: ${score}/${total} (${percent}%)`
    );
  };

  // 1. Loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-3xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
          <span className="font-arabic text-2xl font-bold">بِسْمِ اللهِ</span>
        </div>
        <p className="font-arabic text-lg text-emerald-400 font-bold mb-1">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="text-xs text-slate-400">Menghubungkan ke Platform Belajar Al-Usrah...</p>
      </div>
    );
  }

  // 2. HALAMAN WAJIB LOGIN (Requirement: Protected Route)
  if (!user) {
    return <LoginView />;
  }

  // 3. Authenticated Learning Platform
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 pb-16">
        {currentTab === 'vocab' && (
          <VocabularySection
            masteredIds={userProgress?.completedVocabIds || []}
            onToggleMastered={handleToggleMastered}
          />
        )}

        {currentTab === 'tree' && <FamilyTreeVisualizer />}

        {currentTab === 'quiz' && (
          <QuizSection onQuizCompleted={handleQuizCompleted} />
        )}

        {currentTab === 'tutor' && <ArabicTutorChat />}

        {currentTab === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLearningApp />
    </AuthProvider>
  );
}
