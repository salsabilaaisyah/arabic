import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { Project, Task, ActivityLog, AppUser } from '../types';

const INITIAL_DEMO_PROJECTS: Project[] = [
  {
    id: 'proj_smart_ai_crm',
    title: 'OmniAI - Smart Workspace & Client CRM',
    description: 'Sistem CRM cerdas terpadu dengan otomasi follow-up pelanggan, pipeline penjualan, dan analisis sentimen berbasis Gemini.',
    category: 'SaaS & Enterprise',
    priority: 'high',
    status: 'active',
    ownerId: 'default_admin',
    ownerEmail: 'admin@ideaflow.app',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    tasksCount: 4,
    completedTasksCount: 2,
    keyFeatures: [
      'Dashboard Analisis Pipeline Penjualan',
      'AI Generator Email Penawaran Otomatis',
      'Integrasi WhatsApp & Kalender Google',
      'Scoring Peluang Deal Otomatis'
    ],
    techStack: ['React', 'Express', 'Gemini AI', 'Firestore', 'Tailwind CSS']
  },
  {
    id: 'proj_eco_delivery',
    title: 'GreenLogix - Logistik Ramah Lingkungan',
    description: 'Platform optimasi rute armada pengiriman barang untuk meminimalkan jejak karbon dan memangkas biaya bahan bakar armada.',
    category: 'Logistik & IoT',
    priority: 'medium',
    status: 'planning',
    ownerId: 'default_admin',
    ownerEmail: 'admin@ideaflow.app',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    tasksCount: 3,
    completedTasksCount: 0,
    keyFeatures: [
      'Algoritma Optimasi Rute Pengiriman',
      'Pelacakan Emisi CO2 Realtime',
      'Aplikasi Kurir Mobile Web Responsif'
    ],
    techStack: ['TypeScript', 'Vite', 'Firestore', 'Express']
  }
];

const INITIAL_DEMO_TASKS: Record<string, Task[]> = {
  proj_smart_ai_crm: [
    {
      id: 'task_crm_1',
      projectId: 'proj_smart_ai_crm',
      title: 'Inisialisasi Skema Database Firestore',
      description: 'Menyusun koleksi users, projects, tasks, dan audit activity',
      status: 'done',
      priority: 'high',
      ownerId: 'default_admin',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task_crm_2',
      projectId: 'proj_smart_ai_crm',
      title: 'Integrasi Server-side Gemini 3.8 Flash',
      description: 'Menghubungkan endpoint Express /api/ai/generate-ideas dan brainstorm',
      status: 'done',
      priority: 'high',
      ownerId: 'default_admin',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task_crm_3',
      projectId: 'proj_smart_ai_crm',
      title: 'Implementasi Kanban Board Kolaboratif',
      description: 'Fitur drag-and-drop antar kolom status tugas beserta indikator prioritas',
      status: 'in_progress',
      priority: 'medium',
      ownerId: 'default_admin',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task_crm_4',
      projectId: 'proj_smart_ai_crm',
      title: 'Pengujian Akun Admin dan Deployment Vercel',
      description: 'Verifikasi login admin password 21@prill2005 dan konfigurasi vercel.json',
      status: 'todo',
      priority: 'high',
      ownerId: 'default_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  proj_eco_delivery: [
    {
      id: 'task_eco_1',
      projectId: 'proj_eco_delivery',
      title: 'Riset Regulasi Emisi & Standar Hijau',
      description: 'Mengumpulkan parameter emisi untuk perutean optimal',
      status: 'todo',
      priority: 'medium',
      ownerId: 'default_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task_eco_2',
      projectId: 'proj_eco_delivery',
      title: 'Desain Wireframe Dashboard Logistik',
      description: 'Menyusun tata letak peta armada dan metrik efisiensi',
      status: 'todo',
      priority: 'low',
      ownerId: 'default_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

// Local cache for resilience when offline or during transient network
let localProjectsCache: Project[] = [...INITIAL_DEMO_PROJECTS];
let localTasksCache: Record<string, Task[]> = { ...INITIAL_DEMO_TASKS };
let localLogsCache: ActivityLog[] = [
  {
    id: 'log_init',
    userId: 'system',
    userEmail: 'system@ideaflow.local',
    action: 'Inisialisasi Sistem',
    details: 'Workspace IdeaFlow AI aktif dengan konfigurasi Firebase & Gemini API',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Fetch all projects accessible by user
export async function getProjects(user: AppUser): Promise<Project[]> {
  const collectionPath = 'projects';
  try {
    let q;
    if (user.role === 'admin') {
      q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'), limit(50));
    } else {
      q = query(
        collection(db, collectionPath),
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const projects = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
      localProjectsCache = projects;
      return projects;
    }
  } catch (error) {
    console.warn('Firestore fetch projects error, returning cached/demo projects:', error);
  }
  // Filter local cache if member
  if (user.role === 'admin') {
    return localProjectsCache;
  }
  return localProjectsCache.filter((p) => p.ownerId === user.uid || p.ownerId === 'default_admin');
}

// Create a new project in Firestore
export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const collectionPath = 'projects';
  const id = 'proj_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  const newProject: Project = {
    ...project,
    id,
    createdAt: now,
    updatedAt: now,
    tasksCount: 0,
    completedTasksCount: 0,
  };

  try {
    await setDoc(doc(db, collectionPath, id), newProject);
  } catch (error) {
    console.warn('Firestore write warning:', error);
  }

  localProjectsCache = [newProject, ...localProjectsCache];
  await logActivity(project.ownerId, project.ownerEmail, 'Buat Proyek Baru', `Membuat proyek: ${project.title}`);
  return newProject;
}

// Update project
export async function updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
  const collectionPath = 'projects';
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, collectionPath, projectId), {
      ...updates,
      updatedAt: now,
    });
  } catch (error) {
    console.warn('Firestore update warning:', error);
  }

  localProjectsCache = localProjectsCache.map((p) =>
    p.id === projectId ? { ...p, ...updates, updatedAt: now } : p
  );
}

// Delete project
export async function deleteProject(projectId: string): Promise<void> {
  const collectionPath = 'projects';
  try {
    await deleteDoc(doc(db, collectionPath, projectId));
  } catch (error) {
    console.warn('Firestore delete warning:', error);
  }
  localProjectsCache = localProjectsCache.filter((p) => p.id !== projectId);
  delete localTasksCache[projectId];
}

// Fetch tasks for a project
export async function getTasks(projectId: string): Promise<Task[]> {
  const collectionPath = `projects/${projectId}/tasks`;
  try {
    const q = query(collection(db, collectionPath), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
      localTasksCache[projectId] = tasks;
      return tasks;
    }
  } catch (error) {
    console.warn('Firestore fetch tasks warning:', error);
  }
  return localTasksCache[projectId] || [];
}

// Create a task
export async function createTask(
  projectId: string,
  taskData: Omit<Task, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>
): Promise<Task> {
  const collectionPath = `projects/${projectId}/tasks`;
  const taskId = 'task_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  const newTask: Task = {
    ...taskData,
    id: taskId,
    projectId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, collectionPath, taskId), newTask);
  } catch (error) {
    console.warn('Firestore write task warning:', error);
  }

  const current = localTasksCache[projectId] || [];
  localTasksCache[projectId] = [...current, newTask];

  // Update tasksCount in project
  const tasks = localTasksCache[projectId];
  const completed = tasks.filter((t) => t.status === 'done').length;
  await updateProject(projectId, { tasksCount: tasks.length, completedTasksCount: completed });

  return newTask;
}

// Update task status or fields
export async function updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<void> {
  const collectionPath = `projects/${projectId}/tasks`;
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, collectionPath, taskId), {
      ...updates,
      updatedAt: now,
    });
  } catch (error) {
    console.warn('Firestore update task warning:', error);
  }

  if (localTasksCache[projectId]) {
    localTasksCache[projectId] = localTasksCache[projectId].map((t) =>
      t.id === taskId ? { ...t, ...updates, updatedAt: now } : t
    );
    const tasks = localTasksCache[projectId];
    const completed = tasks.filter((t) => t.status === 'done').length;
    await updateProject(projectId, { tasksCount: tasks.length, completedTasksCount: completed });
  }
}

// Delete task
export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  const collectionPath = `projects/${projectId}/tasks`;
  try {
    await deleteDoc(doc(db, collectionPath, taskId));
  } catch (error) {
    console.warn('Firestore delete task warning:', error);
  }

  if (localTasksCache[projectId]) {
    localTasksCache[projectId] = localTasksCache[projectId].filter((t) => t.id !== taskId);
    const tasks = localTasksCache[projectId];
    const completed = tasks.filter((t) => t.status === 'done').length;
    await updateProject(projectId, { tasksCount: tasks.length, completedTasksCount: completed });
  }
}

// Activity Logging for Admin & Audit
export async function logActivity(
  userId: string,
  userEmail: string,
  action: string,
  details: string
): Promise<void> {
  const collectionPath = 'activity_logs';
  const id = 'log_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  const logItem: ActivityLog = { id, userId, userEmail, action, details, createdAt: now };

  try {
    await setDoc(doc(db, collectionPath, id), logItem);
  } catch (error) {
    // silently catch for audit logs
  }
  localLogsCache = [logItem, ...localLogsCache.slice(0, 49)];
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const collectionPath = 'activity_logs';
  try {
    const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'), limit(30));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const logs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog));
      localLogsCache = logs;
      return logs;
    }
  } catch (e) {
    // fallback
  }
  return localLogsCache;
}
