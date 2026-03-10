import { Types } from 'mongoose';

export interface IUser {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  status?: 'active' | 'deactivated' | 'deleted';
  deactivatedAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
}

export interface IBudgetCategory {
  key?: string;
  label: string;
  description?: string;
  amount: number;
}

export interface ITripLocation {
  lat: number;
  lng: number;
  zoom?: number;
}

export interface ITrip {
  title: string;
  startDate: Date;
  endDate: Date;
  baseCurrency: string;
  totalBudget?: number;
  budgetCategories?: IBudgetCategory[];
  destination?: string;
  location?: ITripLocation;
  joinSecret?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export enum MemberRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export interface IMembership {
  tripId: Types.ObjectId;
  userId: Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
}

export interface IDay {
  tripId: Types.ObjectId;
  dayNumber: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

export enum ActivityStatus {
  PLANNED = 'planned',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export type ExpenseCategory = 'food' | 'shop' | 'other';

export interface IActivityCoordinates {
  lat: number;
  lng: number;
}

export interface IActivity {
  dayId: Types.ObjectId;
  title: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  cost?: number;
  orderIndex: number;
  status: ActivityStatus;
  imageUrl?: string;
  userId?: Types.ObjectId;
  expenseCategory?: ExpenseCategory;
  coordinates?: IActivityCoordinates;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  activityId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttachment {
  activityId: Types.ObjectId;
  userId: Types.ObjectId;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface ITripFile {
  tripId: Types.ObjectId;
  userId: Types.ObjectId;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface IChecklist {
  tripId: Types.ObjectId;
  task: string;
  isCompleted: boolean;
  assignedTo?: Types.ObjectId;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum WebhookEvent {
  TRIP_CREATED = 'trip.created',
  TRIP_UPDATED = 'trip.updated',
  TRIP_DELETED = 'trip.deleted',
  MEMBER_INVITED = 'member.invited',
  MEMBER_REMOVED = 'member.removed',
  ACTIVITY_CREATED = 'activity.created',
  ACTIVITY_UPDATED = 'activity.updated',
  ACTIVITY_DELETED = 'activity.deleted',
  COMMENT_ADDED = 'comment.added',
  CHECKLIST_COMPLETED = 'checklist.completed',
}

export interface IWebhook {
  tripId: Types.ObjectId;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}
