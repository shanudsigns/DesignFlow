export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed' | 'delayed' | 'blocked' | 'in-production';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type UserRole = 'designer' | 'production-manager';

export type DesignerSkill = {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
};

export type DesignerAvailability = {
  date: string;
  type: 'vacation' | 'sick-leave' | 'training' | 'other';
  note?: string;
};

export type TaskAttachment = {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
};

export type TaskComment = {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  designerId: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours?: number;
  day?: string;
  startTime?: string;
  endTime?: string;
  brief?: string;
  briefAttachments?: TaskAttachment[];
  assetLinks?: string[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  dependencies?: string[];
  completedAt?: string;
  createdAt: string;
  assignedToProduction?: boolean;
  productionDate?: string;
  requiredSkills?: string[];
};

export type Designer = {
  id: string;
  name: string;
  color: string;
  active: boolean;
  role: UserRole;
  isAdmin?: boolean;
  profilePicture?: string;
  password?: string;
  skills?: DesignerSkill[];
  availability?: DesignerAvailability[];
  workingHours?: {
    sunday?: { start: string; end: string };
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
  };
  maxDailyHours?: number;
};

export type ReportFilters = {
  designerId?: string;
  timeRange: 'week' | 'month' | 'custom';
  startDate: string;
  endDate: string;
};

export type NotificationType = 
  | 'task-assigned'
  | 'task-completed'
  | 'task-delayed'
  | 'task-blocked'
  | 'task-in-production'
  | 'task-comment'
  | 'task-status-changed'
  | 'availability-updated'
  | 'skill-updated';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  userId: string;
  read: boolean;
  createdAt: string;
};