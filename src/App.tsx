/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { GeminiIdeaStudio } from './components/GeminiIdeaStudio';
import { AdminPanel } from './components/AdminPanel';
import { NewProjectModal } from './components/NewProjectModal';
import { getProjects, deleteProject } from './firebase/firestoreService';
import { Project } from './types';
import { Sparkles } from 'lucide-react';

function MainApp() {
  const { user, loading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<'projects' | 'ai-studio' | 'admin'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Load projects whenever user is present
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    setLoadingProjects(true);
    try {
      const data = await getProjects(user);
      setProjects(data);
    } catch (e) {
      console.error('Failed to load projects:', e);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleProjectCreated = (newId: string) => {
    setIsNewModalOpen(false);
    loadProjects();
    setSelectedProjectId(newId);
    setCurrentTab('projects');
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
      await deleteProject(id);
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
      await loadProjects();
    }
  };

  // 1. Loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 animate-bounce">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Memuat Sesi IdeaFlow AI...</p>
        <span className="text-xs text-slate-500 mt-1">Menghubungkan ke Firebase Auth & Firestore</span>
      </div>
    );
  }

  // 2. HALAMAN WAJIB LOGIN (Requirement: Protected Route)
  if (!user) {
    return <LoginView />;
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // 3. Authenticated Workspace
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar currentTab={currentTab} setCurrentTab={(tab) => {
        setSelectedProjectId(null);
        setCurrentTab(tab);
      }} />

      <main className="flex-1 pb-16">
        {selectedProject ? (
          <ProjectDetail
            project={selectedProject}
            onBack={() => setSelectedProjectId(null)}
            onProjectUpdated={loadProjects}
          />
        ) : (
          <>
            {currentTab === 'projects' && (
              <ProjectList
                projects={projects}
                loading={loadingProjects}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onOpenNewModal={() => setIsNewModalOpen(true)}
                onDeleteProject={handleDeleteProject}
                onOpenAiStudio={() => setCurrentTab('ai-studio')}
              />
            )}

            {currentTab === 'ai-studio' && (
              <GeminiIdeaStudio
                onProjectCreated={handleProjectCreated}
              />
            )}

            {currentTab === 'admin' && <AdminPanel />}
          </>
        )}
      </main>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
