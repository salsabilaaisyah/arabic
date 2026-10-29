import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { playArabicSpeech } from '../data/familyVocabulary';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  RefreshCw,
  Volume2,
} from 'lucide-react';

interface QuizSectionProps {
  onQuizCompleted: (score: number, total: number) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ onQuizCompleted }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizFinished(false);

    try {
      const res = await fetch('/api/ai/arabic-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: 'dasar', count: 5 }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Quiz fetch fallback:', e);
    }

    // Default Fallback Questions
    setQuestions([
      {
        id: 1,
        question: "Apakah terjemahan bahasa Arab dari kata 'Ibu'?",
        options: ['أَبٌ (Abun)', 'أُمٌّ (Ummun)', 'أُخْتٌ (Ukhtun)', 'عَمَّةٌ (\'Ammatun)'],
        correctAnswer: 1,
        explanation: 'أُمٌّ (Ummun) artinya Ibu. Bentuk panggilannya: أُمِّي (Ibuku).',
      },
      {
        id: 2,
        question: 'Kata tunjuk manakah yang tepat untuk melengkapi: "... أَبِي الكَرِيمُ" (Ini ayahku yang mulia)?',
        options: ['هَذِهِ (Haadzihi)', 'هَذَا (Haadzaa)', 'تِلْكَ (Tilka)', 'هُنَا (Hunaa)'],
        correctAnswer: 1,
        explanation: 'Kata "أَبٌ" adalah isim mudzakkar (laki-laki), sehingga menggunakan isim isyarah "هَذَا".',
      },
      {
        id: 3,
        question: "Apakah sebutan untuk 'Paman dari pihak Ibu' dalam bahasa Arab?",
        options: ['عَمٌّ (\'Ammun)', 'خَالٌ (Khaalun)', 'جَدٌّ (Jaddun)', 'زَوْجٌ (Zawjun)'],
        correctAnswer: 1,
        explanation: 'Saudara laki-laki ibu disebut خَالٌ (Khaalun), sedangkan saudara laki-laki ayah disebut عَمٌّ (\'Ammun).',
      },
      {
        id: 4,
        question: 'Apa arti dari kalimat: "هَذِهِ أُخْتِي الصَّغِيرَةُ"?',
        options: [
          'Ini kakak perempuanku',
          'Ini adik perempuanku',
          'Ini anak perempuanku',
          'Ini bibiku',
        ],
        correctAnswer: 1,
        explanation: 'أُخْتِي (Saudariku) + الصَّغِيرَةُ (yang kecil / adik) = Ini adik perempuanku.',
      },
      {
        id: 5,
        question: "Pasangan manakah yang bermakna 'Kakek dan Nenek'?",
        options: [
          'الأَبُ وَالأُمُّ',
          'الزَّوْجُ وَالزَّوْجَةُ',
          'الجَدُّ وَالجَدَّةُ',
          'الاِبْنُ وَالبِنْتُ',
        ],
        correctAnswer: 2,
        explanation: 'الجَدُّ (Kakek) dan الجَدَّةُ (Nenek).',
      },
    ]);
    setLoading(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const currentQ = questions[currentIndex];
    if (selectedOption === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizFinished(true);
      onQuizCompleted(score + (selectedOption === questions[currentIndex].correctAnswer ? 0 : 0), questions.length);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Menyiapkan Kuis Bahasa Arab...</h3>
        <p className="text-xs text-slate-400 mt-1">
          Gemini AI sedang menyusun butir soal latihan materi keluarga
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  if (isQuizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const predicate =
      percentage >= 80
        ? { title: 'مُمْتَازٌ (Mumtaz - Sempurna!)', color: 'text-emerald-400' }
        : percentage >= 60
        ? { title: 'جَيِّدٌ جِدًّا (Jayyid Jiddan - Sangat Baik!)', color: 'text-teal-400' }
        : { title: 'جَيِّدٌ (Jayyid - Terus Berlatih!)', color: 'text-amber-400' };

    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <span className={`font-arabic text-3xl font-bold block ${predicate.color}`}>
              {predicate.title}
            </span>
            <h2 className="text-xl font-bold text-white mt-2">Kuis Materi Keluarga Selesai</h2>
            <p className="text-xs text-slate-400 mt-1">
              Anda menjawab benar {score} dari {questions.length} pertanyaan ({percentage}%)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            Hasil kuis telah dicatat ke progres akun Anda. Ulangi latihan dengan variasi soal baru yang dibuat oleh AI untuk semakin memperkuat hafalan.
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={loadQuiz}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Kuis Baru (Generate AI)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Quiz Progress header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">
          Soal {currentIndex + 1} dari {questions.length}
        </span>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
          Skor Sementara: {score}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Pertanyaan Kuis:
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentQ.question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctAnswer;

            let buttonStyle = 'border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-200';
            if (isAnswerSubmitted) {
              if (isCorrect) {
                buttonStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-2 ring-emerald-500/20';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
              }
            } else if (isSelected) {
              buttonStyle = 'border-emerald-500 bg-emerald-950/30 text-white ring-2 ring-emerald-500/20';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswerSubmitted}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between text-xs sm:text-sm font-semibold transition-all transform active:scale-[0.99] ${buttonStyle}`}
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-400">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </span>
                {isAnswerSubmitted && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {isAnswerSubmitted && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation on submit */}
        {isAnswerSubmitted && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1 animate-fade-in">
            <span className="font-bold text-emerald-400 block">Keterangan Jawaban:</span>
            <p className="leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          {!isAnswerSubmitted ? (
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-600/30"
            >
              Periksa Jawaban
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <span>{currentIndex + 1 === questions.length ? 'Lihat Hasil Kuis' : 'Soal Berikutnya'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
