export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface TripTraveler {
  _id: string;
  name: string;
  avatarUrl?: string;
}

export interface BudgetCategory {
  key?: string;
  label: string;
  description?: string;
  amount: number;
}

export interface Trip {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  baseCurrency: string;
  totalBudget?: number;
  budgetCategories?: BudgetCategory[];
  joinSecret?: string;
  createdBy: User | string;
  createdAt?: string;
  updatedAt?: string;
  userRole?: MemberRole;
  travelerCount?: number;
  travelers?: TripTraveler[];
}

export type MemberRole = 'owner' | 'editor' | 'viewer';

export interface Membership {
  _id: string;
  tripId: string;
  userId: User | { _id: string; name: string; email: string; avatarUrl?: string };
  role: MemberRole;
  joinedAt: string;
}

export interface Day {
  _id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  notes?: string;
  createdAt?: string;
  activityCount?: number;
}

export type ActivityStatus = 'planned' | 'confirmed' | 'completed' | 'cancelled';

export interface Activity {
  _id: string;
  dayId: string;
  title: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  cost?: number;
  orderIndex: number;
  status: ActivityStatus;
  imageUrl?: string;
  userId?: User | { _id: string; name: string; email?: string; avatarUrl?: string };
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  activityId: string;
  userId: User | { _id: string; name: string; email: string; avatarUrl?: string };
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Attachment {
  _id: string;
  activityId: string;
  userId: User | { _id: string; name: string; email: string; avatarUrl?: string };
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface TripFile {
  _id: string;
  tripId: string;
  userId: User | { _id: string; name: string; email: string; avatarUrl?: string };
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export type ChecklistCategory = 'packing' | 'booking' | 'documentation' | 'other';

export interface ChecklistItem {
  _id: string;
  tripId: string;
  task: string;
  isCompleted: boolean;
  assignedTo?: User | { _id: string; name: string; email: string; avatarUrl?: string };
  category?: ChecklistCategory;
  createdAt?: string;
  updatedAt?: string;
}

export interface TripStats {
  totalDays: number;
  totalMembers: number;
  totalExpenses: number;
}
