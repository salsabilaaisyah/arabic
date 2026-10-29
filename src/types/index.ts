export type UserRole = 'admin' | 'member';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRole;
  isCustomAdmin?: boolean;
}

export type Priority = 'low' | 'medium' | 'high';
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: ProjectStatus;
  ownerId: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
  tasksCount?: number;
  completedTasksCount?: number;
  keyFeatures?: string[];
  techStack?: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiSession {
  id: string;
  userId: string;
  projectId?: string;
  prompt: string;
  result: string;
  model: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface GeneratedIdea {
  title: string;
  overview: string;
  category: string;
  targetAudience: string;
  keyFeatures: string[];
  techStack: string[];
  milestones: {
    title: string;
    priority: Priority;
    status: TaskStatus;
  }[];
  potentialChallenges: string[];
  marketValue: string;
}
