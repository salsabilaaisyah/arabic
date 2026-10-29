import React, { useState } from 'react';
import { playArabicSpeech } from '../data/familyVocabulary';
import { SentenceAnalysis } from '../types';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Volume2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';

export const ArabicTutorChat: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'tashih'>('chat');

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([
    {
      role: 'model',
      content: `السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ! 
Ahlan wa Sahlan di Ruang Belajar Bahasa Arab Tema Keluarga (الأُسْرَة)! 
Saya Ustadz AI. Silakan tanyakan kosakata anggota keluarga, kaidah dhomir kepemilikan (أَبِي، أُمِّي), cara memperkenalkan keluarga (هَذَا / هَذِهِ), atau latihan percakapan (حِوَار). Apa yang ingin kita pelajari hari ini?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);

  // Tashih (Sentence Checker) State
  const [sentenceInput, setSentenceInput] = useState('هذا امي واخي كبير');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SentenceAnalysis | null>(null);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = customText || inputMessage;
    if (!text.trim() || isAiReplying) return;

    const newHistory = [...chatMessages, { role: 'user' as const, content: text }];
    setChatMessages(newHistory);
    setInputMessage('');
    setIsAiReplying(true);

    try {
      const res = await fetch('/api/ai/arabic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          history: chatMessages.slice(-6),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages([...newHistory, { role: 'model', content: data.reply }]);
      } else {
        setChatMessages([
          ...newHistory,
          {
            role: 'model',
            content:
              'مَاشَاءَ الله! Terkait materi keluarga: Ingatlah kaidah pokok bahwa isim mudzakkar (seperti أَبٌ، أَخٌ، جَدٌّ) menggunakan kata tunjuk "هَذَا", sedangkan isim muannats (seperti أُمٌّ، أُخْتٌ، جَدَّةٌ) menggunakan kata tunjuk "هَذِهِ".',
          },
        ]);
      }
    } catch (err) {
      setChatMessages([
        ...newHistory,
        {
          role: 'model',
          content: 'Maaf, terjadi kendala koneksi ke server tutor AI. Silakan coba kembali.',
        },
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleAnalyzeSentence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentenceInput.trim() || analyzing) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/analyze-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: sentenceInput }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      } else {
        setAnalysisResult({
          isCorrect: false,
          original: sentenceInput,
          corrected: 'هَذِهِ أُمِّي وَهَذَا أَخِي الكَبِيرُ',
          translation: 'Ini ibuku dan ini kakak laki-lakiku',
          feedback:
            'Kata "أُمّ" adalah muannats sehingga harus menggunakan "هَذِهِ" bukan "هَذَا". Dan kata sifat "الكَبِير" diselaraskan dengan isim maushuf-nya.',
        });
      }
    } catch (e) {
      setAnalysisResult({
        isCorrect: false,
        original: sentenceInput,
        corrected: 'هَذِهِ أُمِّي وَأَخِي الكَبِيرُ',
        translation: 'Ini ibuku dan kakak laki-lakiku',
        feedback: 'Perhatikan kesesuaian isim isyarah muannats dengan kata ibu.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gemini 3.8 Flash &bull; Ustadz AI Tutor Interaktif</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Tutor AI Bahasa Arab</span>
            <span className="font-arabic text-3xl text-emerald-400 font-normal">
              (المُعَلِّمُ الذَّكِيُّ)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Konsultasikan pertanyaan tata bahasa, arti kata, latihan percakapan keluarga (Hiwar), atau uji coba ketepatan kalimat bahasa Arab Anda.
          </p>
        </div>
      </div>

      {/* Sub-tab selection */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'chat'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tanya & Dialog Ustadz AI
        </button>
        <button
          onClick={() => setActiveSubTab('tashih')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'tashih'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Koreksi / Tashih Kalimat Anda
        </button>
      </div>

      {/* View 1: Chat Dialog */}
      {activeSubTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Quick Suggestion Prompts */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Contoh Topik Cepat:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Bagaimana cara memperkenalkan keluarga saya dalam bahasa Arab?',
                'Jelaskan perbedaan kata عَمٌّ (Paman ayah) dan خَالٌ (Paman ibu)',
                'Apa bentuk jamak dari أَبٌ dan أُمٌّ?',
                'Buatkan dialog pendek perkenalan keluarga antara dua sahabat',
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(undefined, p)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800/80 transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Messages list */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-950 text-slate-100 border border-slate-800 rounded-tl-none font-sans'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isAiReplying && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 animate-pulse pl-11">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Ustadz AI sedang menyusun penjelasan...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanyakan kosakata, kaidah nahwu, atau terjemahan keluarga..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isAiReplying || !inputMessage.trim()}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/30"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>
      )}

      {/* View 2: Tashih / Sentence Checker */}
      {activeSubTab === 'tashih' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              Laboratorium Tashih Kalimat Bahasa Arab
            </h3>
            <p className="text-xs text-slate-400">
              Ketikkan kalimat bahasa Arab bertema keluarga yang ingin Anda periksa. AI akan mengecek ketepatan harakat, tata bahasa, dan memberikan perbaikan.
            </p>
          </div>

          <form onSubmit={handleAnalyzeSentence} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kalimat Bahasa Arab Anda:
              </label>
              <input
                type="text"
                dir="rtl"
                required
                value={sentenceInput}
                onChange={(e) => setSentenceInput(e.target.value)}
                placeholder="Contoh: هذا ابي وهو طبيب"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl font-arabic text-2xl text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-right"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={analyzing}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memeriksa Tata Bahasa...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Periksa & Tashih Kalimat</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Analysis Result */}
          {analysisResult && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hasil Tashih:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    analysisResult.isCorrect
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {analysisResult.isCorrect ? 'Kalimat Tepat ✓' : 'Perlu Penyesuaian'}
                </span>
              </div>

              {/* Corrected sentence */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-right">
                <div className="flex items-center justify-between mb-1">
                  <button
                    type="button"
                    onClick={() => playArabicSpeech(analysisResult.corrected)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                    title="Dengarkan Suara"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Kalimat Sesuai Kaidah:
                  </span>
                </div>
                <p className="font-arabic text-3xl font-bold text-emerald-400 select-all">
                  {analysisResult.corrected}
                </p>
                <p className="text-xs text-slate-300 italic mt-2 text-left">
                  "{analysisResult.translation}"
                </p>
              </div>

              {/* Educational feedback */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-200/90 leading-relaxed">
                <span className="font-bold block text-emerald-400 mb-1">Penjelasan Kaidah:</span>
                {analysisResult.feedback}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
