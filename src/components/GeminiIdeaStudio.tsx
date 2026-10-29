import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createProject, createTask } from '../firebase/firestoreService';
import { GeneratedIdea, Priority, TaskStatus } from '../types';
import {
  Sparkles,
  Wand2,
  Rocket,
  CheckCircle2,
  Layers,
  Code2,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

interface GeminiIdeaStudioProps {
  onProjectCreated: (projectId: string) => void;
}

const PRESET_TOPICS = [
  { label: 'SaaS AI Otomasi Invoice UMKM', category: 'Fintech & SaaS' },
  { label: 'Platform Mentoring Koding dengan AI Tutor', category: 'Edutech' },
  { label: 'Marketplace Daur Ulang & Sampah Organik', category: 'Cleantech' },
  { label: 'Sistem Telemedisin & Manajemen Obat Pasien', category: 'Healthtech' },
  { label: 'Asisten Riset Dokumen Hukum Otomatis', category: 'Legaltech' },
];

export const GeminiIdeaStudio: React.FC<GeminiIdeaStudioProps> = ({ onProjectCreated }) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Produktivitas & SaaS');
  const [targetAudience, setTargetAudience] = useState('Pelaku Bisnis & Pengembang Software');
  const [goals, setGoals] = useState('Meningkatkan otomatisasi alur kerja dan memangkas waktu kerja manual');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ideaResult, setIdeaResult] = useState<GeneratedIdea | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          category,
          targetAudience,
          goals,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi endpoint Gemini AI.');
      }

      const data = await response.json();
      setIdeaResult(data);
    } catch (error) {
      console.error('Error generating idea:', error);
      // Fallback preview
      setIdeaResult({
        title: `${topic} - Smart Solution`,
        overview: `Platform inovasi modern yang menjawab tantangan utama di sektor ${category} dengan otomasi proses cerdas.`,
        category,
        targetAudience,
        keyFeatures: [
          'Arsitektur Dashboard Interaktif Terpadu',
          'Automasi Analisis Data Berbasis AI',
          'Kanban Board Kolaborasi Tim Realtime',
          'Ekspor Laporan & Metrik Performa'
        ],
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase Firestore', 'Express', 'Gemini 3.8 Flash'],
        milestones: [
          { title: 'Perancangan Konsep & Validasi Pengguna', priority: 'high', status: 'done' },
          { title: 'Setup Backend Express & Firestore Schema', priority: 'high', status: 'in_progress' },
          { title: 'Pengembangan Fitur Inti & Pipeline AI', priority: 'medium', status: 'todo' },
          { title: 'Peluncuran MVP dan Deploy Vercel', priority: 'medium', status: 'todo' }
        ],
        potentialChallenges: ['Skalabilitas request realtime', 'Akurasi pemrosesan konteks AI', 'Retensi pengguna'],
        marketValue: 'Sangat menjanjikan dengan adopsi digital yang terus bertumbuh pesat.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsProject = async () => {
    if (!ideaResult || !user) return;
    setIsSaving(true);
    try {
      const created = await createProject({
        title: ideaResult.title,
        description: ideaResult.overview,
        category: ideaResult.category || category,
        priority: 'high',
        status: 'active',
        ownerId: user.uid,
        ownerEmail: user.email || 'admin@ideaflow.app',
        keyFeatures: ideaResult.keyFeatures,
        techStack: ideaResult.techStack,
      });

      // Also create initial tasks from milestones
      if (ideaResult.milestones && ideaResult.milestones.length > 0) {
        for (const m of ideaResult.milestones) {
          await createTask(created.id, {
            title: m.title,
            description: `Milestone tugas untuk proyek: ${ideaResult.title}`,
            status: m.status || 'todo',
            priority: m.priority || 'medium',
            ownerId: user.uid,
          });
        }
      }

      setSaveSuccess(true);
      setTimeout(() => {
        onProjectCreated(created.id);
      }, 900);
    } catch (err) {
      console.error('Failed to save project:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (!ideaResult) return;
    const text = `PROYEK: ${ideaResult.title}\n\nOVERVIEW:\n${ideaResult.overview}\n\nFITUR UTAMA:\n${ideaResult.keyFeatures.map((f) => `- ${f}`).join('\n')}\n\nTECH STACK:\n${ideaResult.techStack.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-800/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Google Gemini 3.8 Flash &bull; Server-Side Ideation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Studio Ideasi & Perancangan Proyek
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2">
            Ubah ide sederhana menjadi blueprint aplikasi lengkap, arsitektur teknis, daftar fitur utama, dan rencana kerja kanban dalam hitungan detik.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-400" />
              <span>Parameter Ide Proyek</span>
            </h3>

            {/* Quick preset chips */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Ide Cepat (Klik untuk mencoba):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TOPICS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTopic(p.label);
                      setCategory(p.category);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Topik / Konsep Aplikasi <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Misal: Platform kolaborasi desainer & developer dengan integrasi asset cloud dan feedback canvas..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Produktivitas & SaaS">Produktivitas & SaaS</option>
                    <option value="Fintech & Keuangan">Fintech & Keuangan</option>
                    <option value="Edutech & Pembelajaran">Edutech & Pembelajaran</option>
                    <option value="E-commerce & Ritel">E-commerce & Ritel</option>
                    <option value="Kesehatan & Healthtech">Kesehatan & Healthtech</option>
                    <option value="AI Tools & Utilitas">AI Tools & Utilitas</option>
                    <option value="Sosial & Komunitas">Sosial & Komunitas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Audiens
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Contoh: Freelancer, Korporasi"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tujuan Utama / Goals
                </label>
                <input
                  type="text"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Contoh: Mengurangi waktu pencatatan hingga 80%"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Gemini Sedang Menganalisis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Hasilkan Blueprint dengan Gemini AI</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Blueprint Result Column */}
        <div className="lg:col-span-7">
          {ideaResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in relative">
              {/* Header result */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-semibold">
                    {ideaResult.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
                    {ideaResult.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Target: <span className="text-slate-300">{ideaResult.targetAudience}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                    title="Salin Blueprint"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAsProject}
                    disabled={isSaving || saveSuccess}
                    className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : saveSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Rocket className="w-4 h-4 text-white" />
                    )}
                    <span>{saveSuccess ? 'Tersimpan!' : 'Simpan ke Firestore'}</span>
                  </button>
                </div>
              </div>

              {/* Executive Overview */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Gambaran Eksekutif
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  {ideaResult.overview}
                </p>
              </div>

              {/* Key Features */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Fitur-Fitur Kunci</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ideaResult.keyFeatures.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/70 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>Rekomendasi Arsitektur & Teknologi</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ideaResult.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950/50 text-cyan-300 border border-cyan-800/50 text-xs font-mono font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Milestones / Kanban Blueprint */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Rencana Milestone & Tugas Awal</span>
                </h4>
                <div className="space-y-2">
                  {ideaResult.milestones.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs"
                    >
                      <span className="text-slate-200 font-medium">{m.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {m.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {m.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Viability & Challenges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Tantangan Teknis / Pasar</span>
                  </div>
                  <ul className="text-xs text-amber-200/90 list-disc list-inside space-y-1">
                    {ideaResult.potentialChallenges.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>Potensi & Nilai Pasar</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    {ideaResult.marketValue}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/40">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-4">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold text-slate-200">
                Blueprint Belum Dihasilkan
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                Ketikkan konsep proyek atau klik salah satu ide cepat di kolom kiri, lalu tekan tombol "Hasilkan Blueprint dengan Gemini AI".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
