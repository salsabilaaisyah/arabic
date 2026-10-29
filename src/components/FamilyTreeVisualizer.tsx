import React, { useState } from 'react';
import { playArabicSpeech } from '../data/familyVocabulary';
import { Volume2, Sparkles, Info, Users, Heart } from 'lucide-react';

interface FamilyMemberNode {
  id: string;
  arabic: string;
  transliteration: string;
  indonesian: string;
  possessive: string; // e.g. "أَبِي (Ayahku)"
  gender: 'mudzakkar' | 'muannats';
  demonstrative: string; // "هَذَا" or "هَذِهِ"
  icon: string;
  generation: number;
}

export const FamilyTreeVisualizer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<FamilyMemberNode | null>(null);

  const familyNodes: FamilyMemberNode[] = [
    // Generasi 1: Kakek & Nenek
    {
      id: 'jadd',
      arabic: 'جَدٌّ',
      transliteration: 'Jaddun',
      indonesian: 'Kakek',
      possessive: 'جَدِّي (Kakekku)',
      gender: 'mudzakkar',
      demonstrative: 'هَذَا جَدِّي',
      icon: '👴',
      generation: 1,
    },
    {
      id: 'jaddah',
      arabic: 'جَدَّةٌ',
      transliteration: 'Jaddatun',
      indonesian: 'Nenek',
      possessive: 'جَدَّتِي (Nenekku)',
      gender: 'muannats',
      demonstrative: 'هَذِهِ جَدَّتِي',
      icon: '👵',
      generation: 1,
    },
    // Generasi 2: Ayah & Ibu, Paman & Bibi
    {
      id: 'ab',
      arabic: 'أَبٌ',
      transliteration: 'Abun',
      indonesian: 'Ayah',
      possessive: 'أَبِي (Ayahku)',
      gender: 'mudzakkar',
      demonstrative: 'هَذَا أَبِي',
      icon: '👨',
      generation: 2,
    },
    {
      id: 'umm',
      arabic: 'أُمٌّ',
      transliteration: 'Ummun',
      indonesian: 'Ibu',
      possessive: 'أُمِّي (Ibuku)',
      gender: 'muannats',
      demonstrative: 'هَذِهِ أُمِّي',
      icon: '👩',
      generation: 2,
    },
    {
      id: 'amm',
      arabic: 'عَمٌّ',
      transliteration: "'Ammun",
      indonesian: 'Paman (Saudara Ayah)',
      possessive: 'عَمِّي (Pamanku)',
      gender: 'mudzakkar',
      demonstrative: 'هَذَا عَمِّي',
      icon: '🧔',
      generation: 2,
    },
    {
      id: 'ammah',
      arabic: 'عَمَّةٌ',
      transliteration: "'Ammatun",
      indonesian: 'Bibi (Saudari Ayah)',
      possessive: 'عَمَّتِي (Bibiku)',
      gender: 'muannats',
      demonstrative: 'هَذِهِ عَمَّتِي',
      icon: '🧕',
      generation: 2,
    },
    {
      id: 'khaal',
      arabic: 'خَالٌ',
      transliteration: 'Khaalun',
      indonesian: 'Paman (Saudara Ibu)',
      possessive: 'خَالِي (Pamanku)',
      gender: 'mudzakkar',
      demonstrative: 'هَذَا خَالِي',
      icon: '👨‍💼',
      generation: 2,
    },
    {
      id: 'khaalah',
      arabic: 'خَالَةٌ',
      transliteration: 'Khaalatun',
      indonesian: 'Bibi (Saudari Ibu)',
      possessive: 'خَالَتِي (Bibiku)',
      gender: 'muannats',
      demonstrative: 'هَذِهِ خَالَتِي',
      icon: '👩‍💼',
      generation: 2,
    },
    // Generasi 3: Saudara & Diri Sendiri
    {
      id: 'akh_kabir',
      arabic: 'أَخٌ كَبِيرٌ',
      transliteration: 'Akhun Kabiirun',
      indonesian: 'Kakak Laki-laki',
      possessive: 'أَخِي الكَبِيرُ (Kakak laki-lakiku)',
      gender: 'mudzakkar',
      demonstrative: 'هَذَا أَخِي الكَبِيرُ',
      icon: '🧑',
      generation: 3,
    },
    {
      id: 'ana',
      arabic: 'أَنَا',
      transliteration: 'Anaa',
      indonesian: 'Saya (Diri Sendiri)',
      possessive: 'نَفْسِي (Diriku)',
      gender: 'mudzakkar',
      demonstrative: 'أَنَا فِي بَيْتِي',
      icon: '⭐',
      generation: 3,
    },
    {
      id: 'ukht_kabirah',
      arabic: 'أُخْتٌ كَبِيرَةٌ',
      transliteration: 'Ukhtun Kabiiratun',
      indonesian: 'Kakak Perempuan',
      possessive: 'أُخْتِي الكَبِيرَةُ (Kakak perempuanku)',
      gender: 'muannats',
      demonstrative: 'هَذِهِ أُخْتِي الكَبِيرَةُ',
      icon: '👱‍♀️',
      generation: 3,
    },
    {
      id: 'akh_saghir',
      arabic: 'أَخٌ صَغِيرٌ',
      transliteration: 'Akhun Shaghiirun',
      indonesian: 'Adik Laki-laki',
      possessive: 'أَخِي الصَّغِيرُ (Adik laki-lakiku)',
      gender: 'mudzakkar',
      demonstrative: 'هَذَا أَخِي الصَّغِيرُ',
      icon: '🧒',
      generation: 3,
    },
    // Generasi 4: Anak & Cucu
    {
      id: 'ibn',
      arabic: 'اِبْنٌ',
      transliteration: 'Ibnun',
      indonesian: 'Anak Laki-laki',
      possessive: 'اِبْنِي (Anak laki-lakiku)',
      gender: 'mudzakkar',
      demonstrative: 'هَذَا اِبْنِي',
      icon: '👦',
      generation: 4,
    },
    {
      id: 'bint',
      arabic: 'بِنْتٌ',
      transliteration: 'Bintun',
      indonesian: 'Anak Perempuan',
      possessive: 'بِنْتِي (Anak perempuanku)',
      gender: 'muannats',
      demonstrative: 'هَذِهِ بِنْتِي',
      icon: '👧',
      generation: 4,
    },
    {
      id: 'hafid',
      arabic: 'حَفِيدٌ',
      transliteration: 'Hafiidun',
      indonesian: 'Cucu Laki-laki',
      possessive: 'حَفِيدِي (Cucuku)',
      gender: 'mudzakkar',
      demonstrative: 'هَذَا حَفِيدِي',
      icon: '👶',
      generation: 4,
    },
  ];

  const handleNodeClick = (node: FamilyMemberNode) => {
    setSelectedNode(node);
    playArabicSpeech(node.arabic);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-950/50 via-slate-900 to-emerald-950/50 border border-teal-800/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 border border-teal-700/60 text-teal-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>شَجَرَةُ العَائِلَةِ &bull; Bagan Silsilah Keluarga</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Pohon Silsilah Keluarga</span>
            <span className="font-arabic text-3xl sm:text-4xl text-teal-400 font-normal">
              (شَجَرَةُ النَّسَبِ)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Klik pada setiap anggota keluarga untuk mendengarkan lafaz Arab aslinya, melihat aturan kata tunjuk (هَذَا / هَذِهِ), dan bentuk dhomir kepemilikan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Tree View */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          {/* Level 1: Kakek & Nenek */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <span>Tingkat 1: Generasi Kakek & Nenek (الأَجْدَادُ)</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {familyNodes
                .filter((n) => n.generation === 1)
                .map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center min-w-[140px] transition-all transform active:scale-95 ${
                      selectedNode?.id === node.id
                        ? 'border-teal-400 bg-teal-950/40 shadow-lg shadow-teal-500/20 ring-2 ring-teal-500/30'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-3xl mb-1">{node.icon}</span>
                    <span className="font-arabic text-2xl font-bold text-teal-300">
                      {node.arabic}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {node.transliteration}
                    </span>
                    <span className="text-xs font-bold text-white mt-0.5">
                      {node.indonesian}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Level 2: Ayah & Ibu, Paman & Bibi */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>Tingkat 2: Orang Tua, Paman & Bibi (الآبَاءُ وَالأَعْمَامُ)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {familyNodes
                .filter((n) => n.generation === 2)
                .map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all transform active:scale-95 ${
                      selectedNode?.id === node.id
                        ? 'border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{node.icon}</span>
                    <span className="font-arabic text-xl font-bold text-emerald-300">
                      {node.arabic}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {node.transliteration}
                    </span>
                    <span className="text-[11px] font-bold text-white text-center line-clamp-1 mt-0.5">
                      {node.indonesian}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Level 3: Saudara & Diri Sendiri */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <span>Tingkat 3: Diri Sendiri & Saudara (الإِخْوَةُ وَالأَخَوَاتُ)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {familyNodes
                .filter((n) => n.generation === 3)
                .map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all transform active:scale-95 ${
                      selectedNode?.id === node.id
                        ? 'border-indigo-400 bg-indigo-950/40 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{node.icon}</span>
                    <span className="font-arabic text-xl font-bold text-indigo-300">
                      {node.arabic}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {node.transliteration}
                    </span>
                    <span className="text-[11px] font-bold text-white text-center mt-0.5">
                      {node.indonesian}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Level 4: Anak & Cucu */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span>Tingkat 4: Anak & Cucu (الأَبْنَاءُ وَالأَحْفَادُ)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {familyNodes
                .filter((n) => n.generation === 4)
                .map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all transform active:scale-95 ${
                      selectedNode?.id === node.id
                        ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{node.icon}</span>
                    <span className="font-arabic text-xl font-bold text-amber-300">
                      {node.arabic}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {node.transliteration}
                    </span>
                    <span className="text-[11px] font-bold text-white text-center mt-0.5">
                      {node.indonesian}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-4">
          {selectedNode ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 sticky top-24">
              <div className="text-center pb-4 border-b border-slate-800">
                <span className="text-4xl block mb-2">{selectedNode.icon}</span>
                <h3 className="font-arabic text-4xl font-bold text-emerald-400">
                  {selectedNode.arabic}
                </h3>
                <p className="text-sm font-semibold text-slate-200 mt-1">
                  {selectedNode.indonesian}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedNode.transliteration}
                </p>

                <button
                  type="button"
                  onClick={() => playArabicSpeech(selectedNode.arabic)}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Dengarkan Suara</span>
                </button>
              </div>

              {/* Grammar Cards */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Kata Tunjuk (Isim Isyarah):
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-arabic text-lg text-emerald-300 font-bold">
                      {selectedNode.demonstrative}
                    </span>
                    <button
                      type="button"
                      onClick={() => playArabicSpeech(selectedNode.demonstrative)}
                      className="text-slate-400 hover:text-emerald-400 p-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Menggunakan <strong className="text-white">{selectedNode.gender === 'mudzakkar' ? 'هَذَا (Mudzakkar)' : 'هَذِهِ (Muannats)'}</strong>
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Dhomir Kepemilikan (Dhomir Muttashil):
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-arabic text-lg text-teal-300 font-bold">
                      {selectedNode.possessive.split(' ')[0]}
                    </span>
                    <button
                      type="button"
                      onClick={() => playArabicSpeech(selectedNode.possessive.split(' ')[0])}
                      className="text-slate-400 hover:text-teal-400 p-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Artinya: <strong className="text-white">{selectedNode.possessive.split('(')[1]?.replace(')', '') || 'Milik saya'}</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-3 sticky top-24">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Pilih Anggota Keluarga</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sentuh salah satu kotak silsilah keluarga di sebelah kiri untuk melihat detail tata bahasa dan mendengarkan suaranya.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
