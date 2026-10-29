import React, { useState } from 'react';
import { FAMILY_VOCABULARY, playArabicSpeech } from '../data/familyVocabulary';
import { FamilyCategory, VocabularyItem } from '../types';
import {
  Volume2,
  Search,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Info,
  Filter,
  Check,
} from 'lucide-react';

interface VocabularySectionProps {
  masteredIds: string[];
  onToggleMastered: (vocabId: string) => void;
}

export const VocabularySection: React.FC<VocabularySectionProps> = ({
  masteredIds,
  onToggleMastered,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const categories: { id: string; label: string; arabicLabel: string }[] = [
    { id: 'all', label: 'Semua Kosakata', arabicLabel: 'كُلُّ المُفْرَدَاتِ' },
    { id: 'inti', label: 'Keluarga Inti', arabicLabel: 'الأُسْرَةُ النَّوَوِيَّةُ' },
    { id: 'kakek_nenek', label: 'Kakek, Nenek & Cucu', arabicLabel: 'الأَجْدَادُ وَالأَحْفَادُ' },
    { id: 'kerabat', label: 'Paman & Bibi', arabicLabel: 'الأَعْمَامُ وَالأَخْوَالُ' },
    { id: 'pernikahan', label: 'Suami & Istri', arabicLabel: 'الزَّوْجَانِ' },
  ];

  const filteredVocab = FAMILY_VOCABULARY.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.arabic.includes(searchQuery) ||
      item.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.indonesian.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const progressPercent = Math.round((masteredIds.length / FAMILY_VOCABULARY.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>مُفْرَدَاتُ الأُسْرَةِ وَالعَائِلَةِ &bull; Kosakata Bahasa Arab</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Materi Anggota Keluarga</span>
            <span className="font-arabic text-3xl sm:text-4xl text-emerald-400 font-normal">
              (أَفْرَادُ الأُسْرَةِ)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Pelajari pelafalan bahasa Arab yang fasih dengan harakat lengkap, dhomir kepemilikan (Ayahku, Ibuku), contoh kalimat aplikatif, dan audio bersuara asli.
          </p>

          {/* Progress Tracker */}
          <div className="mt-5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 max-w-md space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Progres Hafalan Anda:</span>
              <span className="text-emerald-400 font-bold">
                {masteredIds.length} dari {FAMILY_VOCABULARY.length} Kosakata ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className="ml-1.5 opacity-70 font-arabic text-xs font-normal">
                {cat.arabicLabel}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari arab, latin, atau arti..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVocab.map((item) => {
          const isMastered = masteredIds.includes(item.id);
          const isSelected = activeCardId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setActiveCardId(item.id)}
              className={`bg-slate-900/90 border rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 relative group cursor-pointer ${
                isMastered
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top badges & Audio */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon || '👤'}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.gender === 'mudzakkar'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {item.gender === 'mudzakkar' ? 'مُذَكَّر (Laki-laki)' : 'مُؤَنَّث (Perempuan)'}
                    </span>
                  </div>

                  {/* Audio Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playArabicSpeech(item.arabic);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors shadow-sm"
                    title="Dengarkan Pelafalan Arab"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Arabic Text (Large Amiri font) */}
                <div className="text-center my-3 py-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
                  <div className="font-arabic text-4xl sm:text-5xl text-emerald-400 font-bold tracking-wide select-all">
                    {item.arabic}
                  </div>
                  <div className="text-xs font-semibold text-slate-300 mt-2 font-mono">
                    {item.transliteration}
                  </div>
                  <div className="text-sm font-extrabold text-white mt-1">
                    {item.indonesian}
                  </div>
                </div>

                {/* Example sentence */}
                <div className="mt-4 p-3 bg-slate-950/40 rounded-xl border border-slate-800/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Contoh Kalimat:
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playArabicSpeech(item.exampleArabic);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Putar</span>
                    </button>
                  </div>
                  <p className="font-arabic text-lg text-slate-200 text-right leading-relaxed select-all">
                    {item.exampleArabic}
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    "{item.exampleTranslation}"
                  </p>
                </div>

                {item.note && (
                  <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-400">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item.note}</span>
                  </div>
                )}
              </div>

              {/* Mastered Button */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMastered(item.id);
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isMastered
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isMastered ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Sudah Dihafal ✓</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      <span>Tandai Sudah Hafal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
