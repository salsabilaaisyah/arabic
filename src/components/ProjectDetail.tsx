import React, { useState, useEffect } from 'react';
import { Project, Task, TaskStatus, Priority } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateProject,
} from '../firebase/firestoreService';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  Send,
  Bot,
  User,
  Layers,
  Code2,
  Calendar,
  Check,
  RefreshCw,
  MessageSquare,
  ListTodo,
  FileText,
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onProjectUpdated: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onProjectUpdated,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'kanban' | 'brainstorm' | 'specs'>('kanban');

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // New task form state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');

  // AI Action Plan generator state
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Brainstorm Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([
    {
      role: 'model',
      content: `Halo! Saya asisten Gemini AI untuk proyek "${project.title}". Apa yang ingin Anda diskusikan hari ini? Saya bisa membantu menyusun arsitektur sistem, memvalidasi fitur, merancang strategi rilis, atau merumuskan model bisnis.`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);

  // Load tasks on mount
  useEffect(() => {
    loadProjectTasks();
  }, [project.id]);

  const loadProjectTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await getTasks(project.id);
      setTasks(data);
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;
    try {
      await createTask(project.id, {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        status: newTaskStatus,
        priority: newTaskPriority,
        ownerId: user.uid,
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
      setShowNewTaskModal(false);
      await loadProjectTasks();
      onProjectUpdated();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, nextStatus: TaskStatus) => {
    try {
      await updateTask(project.id, taskId, { status: nextStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
      );
      onProjectUpdated();
    } catch (e) {
      console.error('Error updating task status:', e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(project.id, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      onProjectUpdated();
    } catch (e) {
      console.error('Error deleting task:', e);
    }
  };

  // Automated Action Plan via Gemini
  const handleGenerateAiPlan = async () => {
    if (!user) return;
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/ai/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: project.title,
          description: project.description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tasks && Array.isArray(data.tasks)) {
          for (const item of data.tasks) {
            await createTask(project.id, {
              title: item.title,
              description: item.description || '',
              status: item.status || 'todo',
              priority: item.priority || 'medium',
              ownerId: user.uid,
            });
          }
          await loadProjectTasks();
          onProjectUpdated();
        }
      }
    } catch (err) {
      console.error('AI plan generation error:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // AI Brainstorm Chat
  const handleSendMessage = async (e?: React.FormEvent, predefinedText?: string) => {
    if (e) e.preventDefault();
    const text = predefinedText || inputMessage;
    if (!text.trim() || isAiReplying) return;

    const newHistory = [...chatMessages, { role: 'user' as const, content: text }];
    setChatMessages(newHistory);
    setInputMessage('');
    setIsAiReplying(true);

    try {
      const res = await fetch('/api/ai/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: project.title,
          projectDescription: project.description,
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
              'Terima kasih atas pertanyaannya. Untuk proyek ini, langkah strategis pertama adalah merumuskan Minimum Viable Product (MVP) yang solid dengan 3 fitur inti utama, serta memastikan alur autentikasi dan database Firestore berjalan stabil.',
          },
        ]);
      }
    } catch (error) {
      setChatMessages([
        ...newHistory,
        {
          role: 'model',
          content: 'Maaf, terjadi kendala saat memproses jawaban. Silakan coba lagi sebentar lagi.',
        },
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleUpdateProjectStatus = async (newStatus: any) => {
    await updateProject(project.id, { status: newStatus });
    project.status = newStatus;
    onProjectUpdated();
  };

  const columns: { id: TaskStatus; title: string; color: string; badge: string }[] = [
    { id: 'todo', title: 'Belum Mulai', color: 'border-slate-700/80', badge: 'bg-slate-800 text-slate-300' },
    { id: 'in_progress', title: 'Sedang Dikerjakan', color: 'border-indigo-600/60', badge: 'bg-indigo-950 text-indigo-300' },
    { id: 'review', title: 'Review & Uji Coba', color: 'border-purple-600/60', badge: 'bg-purple-950 text-purple-300' },
    { id: 'done', title: 'Selesai', color: 'border-emerald-600/60', badge: 'bg-emerald-950 text-emerald-300' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar with Back and Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors mt-0.5"
            title="Kembali ke Daftar Proyek"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-semibold">
                {project.category}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                {project.id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project.title}
            </h1>
          </div>
        </div>

        {/* Status Dropdown & Action buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={project.status}
              onChange={(e) => handleUpdateProjectStatus(e.target.value)}
              className="bg-transparent font-semibold text-indigo-300 focus:outline-none cursor-pointer"
            >
              <option value="planning" className="bg-slate-900 text-white">Perencanaan</option>
              <option value="active" className="bg-slate-900 text-white">Aktif</option>
              <option value="completed" className="bg-slate-900 text-white">Selesai</option>
              <option value="archived" className="bg-slate-900 text-white">Arsip</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowNewTaskModal(true)}
            className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'kanban'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Kanban Board ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('brainstorm')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'brainstorm'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Brainstorming Gemini AI</span>
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'specs'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Spesifikasi & Blueprint</span>
        </button>
      </div>

      {/* Tab 1: Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          {/* AI Action Plan banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-700/60 flex items-center justify-center text-purple-300 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Otomasi Action Plan dengan Gemini AI
                </h4>
                <p className="text-[11px] text-slate-400">
                  Biarkan Gemini menganalisis judul dan gambaran proyek untuk otomatis membuat 5-7 tugas kanban.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateAiPlan}
              disabled={isGeneratingPlan}
              className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isGeneratingPlan ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyusun Action Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Action Plan</span>
                </>
              )}
            </button>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.id === 'done' ? 'bg-emerald-400' : col.id === 'in_progress' ? 'bg-indigo-400' : 'bg-slate-400'}`} />
                      {col.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badge}`}>
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colTasks.length === 0 ? (
                      <div className="h-32 border border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-[11px] text-slate-500">
                        Tidak ada tugas
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 shadow-sm space-y-2 group transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-2">
                              {task.title}
                            </h4>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              title="Hapus Tugas"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-3">
                              {task.description}
                            </p>
                          )}

                          {/* Task bottom meta & column switchers */}
                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                            <span
                              className={`px-1.5 py-0.5 rounded font-semibold ${
                                task.priority === 'high'
                                  ? 'bg-rose-950 text-rose-300'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-950 text-amber-300'
                                  : 'bg-emerald-950 text-emerald-300'
                              }`}
                            >
                              {task.priority}
                            </span>

                            {/* Move status buttons */}
                            <div className="flex items-center gap-1">
                              {col.id !== 'todo' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const order: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
                                    const prevIdx = order.indexOf(col.id) - 1;
                                    handleUpdateTaskStatus(task.id, order[prevIdx]);
                                  }}
                                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px]"
                                  title="Pindah ke kolom sebelumnya"
                                >
                                  &larr;
                                </button>
                              )}
                              {col.id !== 'done' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const order: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
                                    const nextIdx = order.indexOf(col.id) + 1;
                                    handleUpdateTaskStatus(task.id, order[nextIdx]);
                                  }}
                                  className="px-1.5 py-0.5 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 rounded text-[9px] font-bold"
                                  title="Pindah ke kolom berikutnya"
                                >
                                  &rarr;
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: AI Brainstorming */}
      {activeTab === 'brainstorm' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Konsultan AI Gemini 3.8 Flash
                </h3>
                <p className="text-[11px] text-slate-400">
                  Diskusi interaktif khusus untuk akselerasi proyek {project.title}
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              Online
            </span>
          </div>

          {/* Quick prompt suggestions */}
          <div className="flex flex-wrap gap-2">
            {[
              'Apa fitur pembeda (unique selling point) terbaik untuk proyek ini?',
              'Bagaimana rancangan skema arsitektur database yang paling scalable?',
              'Tuliskan draf strategi peluncuran MVP dalam 30 hari ke depan.',
              'Apa potensi celah keamanan yang perlu diwaspadai?',
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(undefined, p)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 transition-colors text-left"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat messages */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-900 border border-indigo-700 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isAiReplying && (
              <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse pl-10">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Gemini sedang berpikir dan menganalisis ide...</span>
              </div>
            )}
          </div>

          {/* Chat input form */}
          <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanyakan analisis, strategi, arsitektur, atau fitur berikutnya..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isAiReplying || !inputMessage.trim()}
              className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Specs and Blueprint */}
      {activeTab === 'specs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Deskripsi Proyek</h3>
            <p className="text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {project.description}
            </p>
          </div>

          {project.keyFeatures && project.keyFeatures.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Fitur Utama yang Direncanakan</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.keyFeatures.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.techStack && project.techStack.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Arsitektur & Tech Stack</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 text-xs font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Dibuat oleh: {project.ownerEmail}</span>
            <span>Tanggal: {new Date(project.createdAt).toLocaleString('id-ID')}</span>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Tambah Tugas Baru</span>
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Tugas <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Misal: Buat integrasi Google Auth..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deskripsi / Kriteria Selesai
                </label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Detail tugas atau catatan..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Kolom
                  </label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="todo">Belum Mulai</option>
                    <option value="in_progress">Sedang Dikerjakan</option>
                    <option value="review">Review & Test</option>
                    <option value="done">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prioritas
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Rendah (Low)</option>
                    <option value="medium">Menengah (Medium)</option>
                    <option value="high">Tinggi (High)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
