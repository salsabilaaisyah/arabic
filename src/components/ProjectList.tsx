import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Trash2,
  Clock,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Tag,
} from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  onSelectProject: (projectId: string) => void;
  onOpenNewModal: () => void;
  onDeleteProject: (projectId: string) => void;
  onOpenAiStudio: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  loading,
  onSelectProject,
  onOpenNewModal,
  onDeleteProject,
  onOpenAiStudio,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FolderKanban className="w-7 h-7 text-indigo-400" />
            <span>Workspace Ide & Proyek</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola inovasi, backlog tugas, dan otomasi alur kerja Anda dengan sinkronisasi Firestore realtime.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAiStudio}
            className="py-2.5 px-4 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/60 text-purple-200 text-xs font-semibold flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Studio Ide AI</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewModal}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Proyek Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua Proyek' },
            { id: 'active', label: 'Sedang Aktif' },
            { id: 'planning', label: 'Perencanaan' },
            { id: 'completed', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari proyek atau kategori..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-64 animate-pulse"
            />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center bg-slate-900/30">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Belum Ada Proyek Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Mulai eksplorasi ide baru Anda dengan tombol "+ Proyek Baru" atau buat secara otomatis lewat "Studio Ide AI".
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={onOpenNewModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
            >
              Buat Proyek Manual
            </button>
            <button
              onClick={onOpenAiStudio}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors"
            >
              Generate dengan AI
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const totalTasks = project.tasksCount || 0;
            const completedTasks = project.completedTasksCount || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            const priorityColors = {
              high: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
              medium: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
              low: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
            }[project.priority || 'medium'];

            const statusColors = {
              active: 'bg-indigo-950 text-indigo-300 border-indigo-800',
              planning: 'bg-cyan-950 text-cyan-300 border-cyan-800',
              completed: 'bg-emerald-950 text-emerald-300 border-emerald-800',
              archived: 'bg-slate-800 text-slate-400 border-slate-700',
            }[project.status || 'active'];

            return (
              <div
                key={project.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold truncate">
                      {project.category || 'Umum'}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${priorityColors}`}>
                        {project.priority?.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${statusColors}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3
                    onClick={() => onSelectProject(project.id)}
                    className="text-lg font-bold text-white group-hover:text-indigo-400 cursor-pointer transition-colors line-clamp-1"
                  >
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Progress Kanban:</span>
                      <span className="text-white font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Tasks count & Date */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{completedTasks} dari {totalTasks} tugas selesai</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(project.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom card actions */}
                <div className="mt-5 pt-3 flex items-center justify-between gap-2 border-t border-slate-800/40">
                  <button
                    type="button"
                    onClick={() => onDeleteProject(project.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Hapus Proyek"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectProject(project.id)}
                    className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Buka Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
