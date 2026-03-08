import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import type { Activity } from '../types';
import { formatPrice } from '../utils/helpers';

const statusColors: Record<string, string> = {
  planned: 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200',
  confirmed: 'bg-accent/20 text-accent',
  completed: 'bg-success/20 text-success',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

interface ActivityCardProps {
  activities: Activity[];
  canEdit: boolean;
  onReorder: (reordered: Activity[]) => void;
  onOpenDetail: (activityId: string) => void;
  onDelete: (activityId: string) => Promise<void>;
}

export function ActivityCard({
  activities,
  canEdit,
  onReorder,
  onOpenDetail,
  onDelete,
}: ActivityCardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, activityId: string) => {
    e.stopPropagation();
    if (!confirm('Delete this activity?')) return;
    setDeletingId(activityId);
    await onDelete(activityId);
    setDeletingId(null);
  };

  if (activities.length === 0) return null;

  return (
    <Reorder.Group
      axis="y"
      values={activities}
      onReorder={onReorder}
      className="space-y-2"
    >
      {activities.map((activity) => (
        <Reorder.Item
          key={activity._id}
          value={activity}
          className="cursor-grab active:cursor-grabbing list-none"
        >
          <motion.div
            layout
            onClick={() => onOpenDetail(activity._id)}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/40 transition-colors"
          >
            {canEdit && (
              <span className="text-slate-400 shrink-0" title="Drag to reorder">
                ⋮⋮
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{activity.title}</p>
              {(activity.location || activity.cost != null) && (
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {[activity.location, activity.cost != null && activity.cost > 0 ? formatPrice(activity.cost, 'USD') : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </div>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded capitalize ${statusColors[activity.status] ?? statusColors.planned}`}>
              {activity.status}
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={(e) => handleDelete(e, activity._id)}
                disabled={deletingId === activity._id}
                className="shrink-0 text-slate-400 hover:text-red-500 p-1"
                aria-label="Delete"
              >
                ×
              </button>
            )}
          </motion.div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
