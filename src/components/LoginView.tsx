import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  BookOpen,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Terminal,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loginWithAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'admin' | 'google'>('admin');

  // Admin form state
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('21@prill2005');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await loginWithAdmin(adminUsername, adminPassword);
      if (!res.success) {
        setErrorMsg(res.message || 'Login admin gagal. Password tidak cocok.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan jaringan atau server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in dibatalkan atau gagal.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAdminPreset = () => {
    setAdminUsername('admin');
    setAdminPassword('21@prill2005');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-600/20 via-teal-600/20 to-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        {/* App Title & Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 text-xs font-semibold mb-6 shadow-sm backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Al-Usrah (الأُسْرَة) &bull; Belajar Bahasa Arab Tema Keluarga</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-center tracking-tight text-white mb-2">
          Pembelajaran Bahasa Arab <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">Tema Keluarga</span>
        </h1>
        <p className="font-arabic text-2xl sm:text-3xl text-emerald-400 text-center mb-4">
          (دِرَاسَةُ اللُّغَةِ العَرَبِيَّةِ: أَفْرَادُ الأُسْرَةِ)
        </p>
        <p className="text-slate-400 text-center max-w-xl text-xs sm:text-sm mb-8">
          Akses materi kosakata interaktif, pohon silsilah keluarga, kuis latihan bertingkat, dan bimbingan Ustadz AI cerdas. Masuk menggunakan Google Sign-In atau akun Administrator.
        </p>

        {/* Login Box */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Tab Selection */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/70 rounded-2xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Login Admin</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('google');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'google'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Sign-in</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tab 1: Admin Form */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Masukkan username admin"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password Admin
                  </label>
                  <button
                    type="button"
                    onClick={setAdminPreset}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
                  >
                    Gunakan Default
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Masukkan password admin"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password indicator */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-xs text-emerald-300/90 flex items-start gap-2.5">
                <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Kredensial Sesuai Permintaan:</span>
                  <div className="mt-1 font-mono text-[11px] text-emerald-200 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-emerald-900/60">
                    Password: <span className="text-amber-400 font-bold select-all">21@prill2005</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk Sebagai Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Google Sign-in */}
          {activeTab === 'google' && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-slate-400 text-center">
                Masuk aman menggunakan autentikasi Firebase Google Popup. Progres belajar kosakata dan skor kuis tersimpan otomatis di Firestore.
              </p>

              <button
                type="button"
                onClick={handleGoogleSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Lanjutkan dengan Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Features badge */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Halaman Wajib Login</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Database Firestore Realtime</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Audio Pelafalan Arab Asli</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Ustadz AI Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
