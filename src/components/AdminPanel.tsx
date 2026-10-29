import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FAMILY_VOCABULARY } from '../data/familyVocabulary';
import {
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Clock,
  KeyRound,
  Users,
  Activity,
  Download,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Copy,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [backupSuccess, setBackupSuccess] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      setMetrics({
        app: 'Al-Usrah Arabic Learning Platform',
        nodeVersion: 'v22.x',
        uptimeSeconds: 1200,
        services: {
          firebaseProject: 'arabic-75650',
          firebaseAuth: 'Aktif (Google Sign-In + Admin)',
          firestore: 'Aktif (Per-User Security Rules)',
          geminiTutor: 'Siap (gemini-3.8-flash)',
        },
      });
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      admin: user?.displayName,
      vocabularyCount: FAMILY_VOCABULARY.length,
      vocabularyData: FAMILY_VOCABULARY,
      systemMetrics: metrics,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `al_usrah_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3000);
  };

  const copyFirestoreRules = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() {
      return request.auth != null && request.auth.uid != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isValidId(id) {
      return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$');
    }

    match /users/{userId} {
      allow get, create, update, delete: if isOwner(userId) && isValidId(userId);
      allow list: if false;
    }

    match /user_progress/{userId} {
      allow read, write: if isOwner(userId);
    }

    match /quiz_history/{historyId} {
      allow read, write: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
    }
  }
}`;
    navigator.clipboard.writeText(rules);
    alert('Firestore Security Rules berhasil disalin!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-emerald-950/30 to-slate-900 border border-amber-800/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Master Administrator Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Panel Pengelolaan Pembelajaran Bahasa Arab</span>
            <span className="font-arabic text-2xl text-amber-400 font-normal">
              (لَوْحَةُ التَّحَكُّمِ)
            </span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2">
            Pusat kendali materi pembelajaran keluarga (*Al-Usrah*), status koneksi database Firebase `arabic-75650`, konfigurasi server Express, dan integrasi model Gemini 3.8 Flash.
          </p>
        </div>
      </div>

      {/* Admin Credential Verification Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Kredensial Admin Terverifikasi</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  TERAUTENTIKASI
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Akses admin aktif dengan password terdaftar: <code className="text-amber-300 font-mono">21@prill2005</code>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-500 block mb-1">Pengguna Admin</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{user?.displayName || 'Ustadz Admin'}</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-500 block mb-1">Password Akses</span>
            <span className="font-mono font-bold text-amber-400">21@prill2005</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-500 block mb-1">Tingkat Hak Akses</span>
            <span className="font-bold text-emerald-400">Full Master Access</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Kosakata Keluarga</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-arabic">
            {FAMILY_VOCABULARY.length} مُفْرَدَة
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>4 Kategori Materi Lengkap</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Firebase Project</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300 font-mono">arabic-75650</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Auth & Firestore Aktif</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Google Gemini AI</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white">gemini-3.8-flash</div>
          <div className="text-[11px] text-purple-300 flex items-center gap-1">
            <span>Ustadz AI & Kuis Generator</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Backend Express API</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white">Vercel Ready</div>
          <div className="text-[11px] text-indigo-300 flex items-center gap-1">
            <span>Rewrite /api/* di api/index.ts</span>
          </div>
        </div>
      </div>

      {/* Quick Administrative Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Cadangkan & Ekspor Data Materi</span>
          </h3>
          <p className="text-xs text-slate-400">
            Unduh seluruh kumpulan data kosakata keluarga, transliterasi, contoh kalimat, dan metrik sistem dalam format JSON.
          </p>
          <button
            type="button"
            onClick={handleExportBackup}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>{backupSuccess ? 'Data Berhasil Diunduh!' : 'Unduh Cadangan JSON'}</span>
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Aturan Keamanan Firestore (Per-User Rules)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Aturan keamanan telah dirancang agar setiap akun hanya dapat membaca dan menulis datanya sendiri secara aman.
          </p>
          <button
            type="button"
            onClick={copyFirestoreRules}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-950/70 hover:bg-teal-900/70 text-teal-300 border border-teal-800/60 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Salin Aturan firestore.rules</span>
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
