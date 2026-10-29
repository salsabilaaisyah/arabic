import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LogOut,
  ShieldCheck,
  FolderKanban,
  Wand2,
  Settings,
  User,
  Server,
  CheckCircle,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'projects' | 'ai-studio' | 'admin';
  setCurrentTab: (tab: 'projects' | 'ai-studio' | 'admin') => void;
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
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('projects')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  IdeaFlow <span className="text-indigo-400">AI</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 font-medium">
                  Workspace & Ideation Hub
                </span>
              </div>
            </button>

            {/* Navigation items */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCurrentTab('projects')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentTab === 'projects'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FolderKanban className="w-4 h-4 text-indigo-400" />
                <span>Proyek & Kanban</span>
              </button>

              <button
                onClick={() => setCurrentTab('ai-studio')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentTab === 'ai-studio'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Wand2 className="w-4 h-4 text-purple-400" />
                <span>Studio Ide Gemini</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentTab === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Panel Admin</span>
                  <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/40">
                    MASTER
                  </span>
                </button>
              )}
            </nav>
          </div>

          {/* Right section: System Status + Profile + Logout Button */}
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Express /api &bull; Firestore</span>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-900/80 border border-indigo-700/60 flex items-center justify-center text-indigo-300 text-[11px] font-bold">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-semibold text-slate-200 max-w-[120px] truncate leading-tight">
                  {user?.displayName || 'Pengguna'}
                </span>
                <span className="text-[10px] text-slate-400 max-w-[120px] truncate">
                  {user?.email || 'Admin'}
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
                {isAdmin ? '👑 Admin' : 'Member'}
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
            onClick={() => setCurrentTab('projects')}
            className={`flex flex-col items-center gap-1 text-[10px] py-1 px-3 rounded-lg ${
              currentTab === 'projects' ? 'text-indigo-400 font-bold bg-slate-900' : 'text-slate-400'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Proyek</span>
          </button>
          <button
            onClick={() => setCurrentTab('ai-studio')}
            className={`flex flex-col items-center gap-1 text-[10px] py-1 px-3 rounded-lg ${
              currentTab === 'ai-studio' ? 'text-purple-400 font-bold bg-slate-900' : 'text-slate-400'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Studio AI</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex flex-col items-center gap-1 text-[10px] py-1 px-3 rounded-lg ${
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
                Apakah Anda yakin ingin keluar dari sesi akun saat ini?
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
