import api from './axios';
import type {
  User,
  Trip,
  BudgetCategory,
  Membership,
  Day,
  Activity,
  Comment,
  Attachment,
  TripFile,
  ChecklistItem,
  TripStats,
  MemberRole,
  ActivityStatus,
  ChecklistCategory,
} from '../types';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : (import.meta.env.DEV ? '/api' : '');

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; avatarUrl?: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data),
  me: () => api.get<{ user: User }>('/auth/me'),
};

export const tripsApi = {
  list: () => api.get<{ trips: Trip[] }>('/trips'),
  get: (id: string) =>
    api.get<{ trip: Trip & { userRole?: MemberRole }; members: Membership[]; days: Day[] }>(`/trips/${id}`),
  create: (data: {
    title: string;
    startDate: string;
    endDate: string;
    baseCurrency?: string;
    totalBudget?: number;
    budgetCategories?: BudgetCategory[];
  }) => api.post<{ trip: Trip }>('/trips', data),
  update: (id: string, data: Partial<Pick<Trip, 'title' | 'startDate' | 'endDate' | 'baseCurrency' | 'totalBudget' | 'budgetCategories'>>) =>
    api.put<{ trip: Trip }>(`/trips/${id}`, data),
  delete: (id: string) => api.delete(`/trips/${id}`),
  stats: (id: string) => api.get<{ stats: TripStats }>(`/trips/${id}/stats`),
  getFeed: (id: string) =>
    api.get<{ feed: Array<{ type: string; userName: string; text: string; detail?: string; timestamp: string }> }>(`/trips/${id}/feed`),
  sendMessage: (id: string, content: string) =>
    api.post<{ message: string }>(`/trips/${id}/messages`, { content }),
};

export const membersApi = {
  list: (tripId: string) => api.get<{ members: Membership[] }>(`/memberships/${tripId}`),
  invite: (tripId: string, email: string, role: MemberRole) =>
    api.post<{ membership: Membership }>(`/memberships/${tripId}/invite`, { email, role }),
  updateRole: (membershipId: string, role: MemberRole) =>
    api.put<{ membership: Membership }>(`/memberships/${membershipId}/role`, { role }),
  remove: (membershipId: string) => api.delete(`/memberships/${membershipId}`),
  leave: (tripId: string) => api.post(`/memberships/${tripId}/leave`),
};

export const daysApi = {
  list: (tripId: string) => api.get<{ days: (Day & { activityCount?: number })[] }>(`/days/trip/${tripId}`),
  get: (id: string) => api.get<{ day: Day }>(`/days/${id}`),
  create: (data: { tripId: string; dayNumber: number; date: string; notes?: string }) =>
    api.post<{ day: Day }>('/days', data),
  update: (id: string, data: Partial<Pick<Day, 'dayNumber' | 'date' | 'notes'>>) =>
    api.put<{ day: Day }>(`/days/${id}`, data),
  delete: (id: string) => api.delete(`/days/${id}`),
};

export const activitiesApi = {
  listByDay: (dayId: string) => api.get<{ activities: Activity[] }>(`/activities/day/${dayId}`),
  get: (id: string) =>
    api.get<{ activity: Activity; comments: Comment[]; attachments: Attachment[] }>(`/activities/${id}`),
  create: (data: {
    dayId: string;
    title: string;
    description?: string;
    location?: string;
    startTime?: string;
    endTime?: string;
    cost?: number;
    status?: ActivityStatus;
    imageUrl?: string;
  }) => api.post<{ activity: Activity }>('/activities', data),
  update: (id: string, data: Partial<Pick<Activity, 'title' | 'description' | 'location' | 'startTime' | 'endTime' | 'cost' | 'status' | 'imageUrl'>>) =>
    api.put<{ activity: Activity }>(`/activities/${id}`, data),
  reorder: (activities: { id: string; orderIndex: number }[]) =>
    api.post('/activities/reorder', { activities }),
  delete: (id: string) => api.delete(`/activities/${id}`),
};

export const commentsApi = {
  list: (activityId: string) => api.get<{ comments: Comment[] }>(`/comments/activity/${activityId}`),
  create: (activityId: string, content: string) =>
    api.post<{ comment: Comment }>('/comments', { activityId, content }),
  update: (id: string, content: string) => api.put<{ comment: Comment }>(`/comments/${id}`, { content }),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

export const attachmentsApi = {
  list: (activityId: string) => api.get<{ attachments: Attachment[] }>(`/attachments/activity/${activityId}`),
  upload: (activityId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    form.append('activityId', activityId);
    return api.post<{ attachment: Attachment }>('/attachments', form);
  },
  delete: (id: string) => api.delete(`/attachments/${id}`),
};

export function attachmentUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const base = baseURL.replace(/\/api\/?$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export const checklistsApi = {
  list: (tripId: string, params?: { category?: string; isCompleted?: boolean }) =>
    api.get<{ items: ChecklistItem[] }>(`/checklists/trip/${tripId}`, { params }),
  create: (data: { tripId: string; task: string; category?: ChecklistCategory; assignedTo?: string }) =>
    api.post<{ item: ChecklistItem }>('/checklists', data),
  update: (id: string, data: Partial<Pick<ChecklistItem, 'task' | 'isCompleted' | 'assignedTo' | 'category'>>) =>
    api.put<{ item: ChecklistItem }>(`/checklists/${id}`, data),
  delete: (id: string) => api.delete(`/checklists/${id}`),
};

export const tripFilesApi = {
  list: (tripId: string) =>
    api.get<{ files: TripFile[] }>(`/trip-files/trip/${tripId}`),
  upload: (tripId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    form.append('tripId', tripId);
    return api.post<{ file: TripFile }>('/trip-files', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => api.delete(`/trip-files/${id}`),
};

export function fileUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const base = baseURL.replace(/\/api\/?$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
