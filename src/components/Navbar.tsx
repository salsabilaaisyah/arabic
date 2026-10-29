import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LogOut,
  ShieldCheck,
  BookOpen,
  GitFork,
  HelpCircle,
  Bot,
  User,
  Users,
} from 'lucide-react';

export type MainNavTab = 'vocab' | 'tree' | 'quiz' | 'tutor' | 'admin';

interface NavbarProps {
  currentTab: MainNavTab;
  setCurrentTab: (tab: MainNavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, isAdmin, logout } = useAuth();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleLogout = async () => {
    setShowConfirmLogout(false);
    await logout();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('vocab')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <span className="font-arabic text-lg font-bold text-white leading-none">أ</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Al-Usrah <span className="font-arabic text-emerald-400 font-semibold text-xl">الأُسْرَة</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 font-medium">
                  Belajar Bahasa Arab Tema Keluarga
                </span>
              </div>
            </button>

            {/* Desktop Navigation items */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCurrentTab('vocab')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'vocab'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-300" />
                <span>Kosakata (المُفْرَدَات)</span>
              </button>

              <button
                onClick={() => setCurrentTab('tree')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'tree'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <GitFork className="w-4 h-4 text-teal-300" />
                <span>Pohon Silsilah (الشَّجَرَة)</span>
              </button>

              <button
                onClick={() => setCurrentTab('quiz')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'quiz'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-amber-300" />
                <span>Kuis Latihan (الاِخْتِبَار)</span>
              </button>

              <button
                onClick={() => setCurrentTab('tutor')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'tutor'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Bot className="w-4 h-4 text-purple-300" />
                <span>Ustadz AI (المُعَلِّم)</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin</span>
                  <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/40">
                    MASTER
                  </span>
                </button>
              )}
            </nav>
          </div>

          {/* Right section: User Profile + Logout Button */}
          <div className="flex items-center gap-3">
            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center text-emerald-300 text-[11px] font-bold">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-semibold text-slate-200 max-w-[120px] truncate leading-tight">
                  {user?.displayName || 'Thalib / Siswa'}
                </span>
                <span className="text-[10px] text-slate-400 max-w-[120px] truncate">
                  {user?.email || 'Akun Siswa'}
                </span>
              </div>
              {/* Role badge */}
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  isAdmin
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isAdmin ? '👑 Admin' : 'Siswa'}
              </span>
            </div>

            {/* TOMBOL LOGOUT (Wajib & Sangat Jelas) */}
            <button
              onClick={() => setShowConfirmLogout(true)}
              title="Keluar dari akun"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-all transform active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-900 bg-slate-950 px-2 py-2">
          <button
            onClick={() => setCurrentTab('vocab')}
            className={`flex flex-col items-center gap-1 text-[10px] py-1 px-2 rounded-lg ${
              currentTab === 'vocab' ? 'text-emerald-400 font-bold bg-slate-900' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kosakata</span>
          </button>
          <button
            onClick={() => setCurrentTab('tree')}
            className={`flex flex-col items-center gap-1 text-[10px] py-1 px-2 rounded-lg ${
              currentTab === 'tree' ? 'text-teal-400 font-bold bg-slate-900' : 'text-slate-400'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>Silsilah</span>
          </button>
          <button
            onClick={() => setCurrentTab('quiz')}
            className={`flex flex-col items-center gap-1 text-[10px] py-1 px-2 rounded-lg ${
              currentTab === 'quiz' ? 'text-amber-400 font-bold bg-slate-900' : 'text-slate-400'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Kuis</span>
          </button>
          <button
            onClick={() => setCurrentTab('tutor')}
            className={`flex flex-col items-center gap-1 text-[10px] py-1 px-2 rounded-lg ${
              currentTab === 'tutor' ? 'text-purple-400 font-bold bg-slate-900' : 'text-slate-400'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Tutor AI</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex flex-col items-center gap-1 text-[10px] py-1 px-2 rounded-lg ${
                currentTab === 'admin' ? 'text-amber-400 font-bold bg-slate-900' : 'text-amber-400/70'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* Logout confirmation modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Konfirmasi Logout</h3>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin keluar dari sesi akun pembelajaran?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmLogout(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
