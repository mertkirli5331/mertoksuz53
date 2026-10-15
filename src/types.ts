export type DriveLinkType = 'folder' | 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'form' | 'other';

export interface DriveLink {
  id: string;
  title: string;
  url: string;
  type: DriveLinkType;
  addedAt: string;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type WeekStatus = 'not_started' | 'in_progress' | 'completed';

export interface WeekPlan {
  weekNumber: number; // 1 - 38
  title: string;
  subtitle: string;
  status: WeekStatus;
  notes: string;
  driveLinks: DriveLink[];
  tasks: ChecklistItem[];
  colorTag?: string;
  updatedAt: string;
}

export interface AppSyncData {
  lastUpdated: string;
  weeks: WeekPlan[];
}

export interface AdminUser {
  username: string;
  email: string;
}

export interface AuthState {
  isAdmin: boolean;
  user: AdminUser | null;
  token: string | null;
}

