export enum ViewState {
  PROJECTS = 'PROJECTS',
  TASKS = 'TASKS',
  TIMELINE = 'TIMELINE',
  RISKS = 'RISKS',
  MONTHLY_REVIEW = 'MONTHLY_REVIEW',
  DASHBOARD = 'DASHBOARD',
  CONFIGURATION = 'CONFIGURATION',
  GLOBAL_DASHBOARD = 'GLOBAL_DASHBOARD',
  GLOBAL_REVIEW = 'GLOBAL_REVIEW'
}

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // In a real app, never store plain text. This is for demo only.
  assignedLineId?: string; // If User, they are locked to this line
}

export interface WorkLine {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Project {
  id: string;
  lineId: string;
  name: string;
  objective: string;
  assignee: string;
  startDate: string;
  endDate: string;
  status: 'Ready to Start' | 'In Progress' | 'Delayed' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  difficulty: 'Low' | 'Medium' | 'High';
  nextSteps: string[];
  notes: string;
  budget: number;
  progress: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 string for demo purposes
  createdAt: string;
}

export interface Task {
  id: string;
  parentId?: string | null; // ID of the parent task if this is a subtask
  lineId: string;
  projectId: string;
  title: string;
  assignee: string;
  startDate: string;
  endDate: string;
  status: 'Ready to Start' | 'In Progress' | 'Delayed' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  difficulty: 'Low' | 'Medium' | 'High';
  progress: number;
  dependencies: string;
  comments: string;
  checklist: ChecklistItem[];
  attachments: Attachment[];
}

export interface Risk {
  id: string;
  lineId: string;
  taskId?: string; // Linked task or subtask
  description: string;
  responsible: string; // Replaces probability
  requiredAction: string; // New field
  status: 'Open' | 'In Progress' | 'Mitigated' | 'Closed'; // New field
  priority: 'Low' | 'Medium' | 'High'; // New field
  impact: 'Low' | 'Medium' | 'High';
  mitigationStrategy?: string;
}

export interface MonthlyReview {
  id: string;
  lineId: string;
  month: string; // YYYY-MM
  summary: string;
  achievements: string;
  issues: string;
}