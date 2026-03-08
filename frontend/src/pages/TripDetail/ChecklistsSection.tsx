import type { ChecklistItem } from '../../types';
import { landingColors } from '../../landing/theme';

interface ChecklistsSectionProps {
  checklists: ChecklistItem[];
  canEdit: boolean;
  newChecklistTask: string;
  setNewChecklistTask: (v: string) => void;
  newChecklistCategory: string;
  setNewChecklistCategory: (v: string) => void;
  onAddChecklist: (e: React.FormEvent) => void;
  onToggleChecklist: (item: ChecklistItem) => void;
  onDeleteChecklistItem: (itemId: string) => void;
}

export function ChecklistsSection({
  checklists,
  canEdit,
  newChecklistTask,
  setNewChecklistTask,
  newChecklistCategory,
  setNewChecklistCategory,
  onAddChecklist,
  onToggleChecklist,
  onDeleteChecklistItem,
}: ChecklistsSectionProps) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-6 w-full">
      <div className="w-full max-w-4xl space-y-4">
        {canEdit && (
          <form onSubmit={onAddChecklist} className="flex gap-2 flex-wrap">
            <input
              value={newChecklistTask}
              onChange={(e) => setNewChecklistTask(e.target.value)}
              placeholder="New task (e.g. Pack passport)"
              className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
            />
            <select
              value={newChecklistCategory}
              onChange={(e) => setNewChecklistCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
            >
              <option value="packing">Packing</option>
              <option value="booking">Booking</option>
              <option value="documentation">Documentation</option>
              <option value="other">Other</option>
            </select>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: landingColors.primary }}>
              Add
            </button>
          </form>
        )}
        <ul className="space-y-2">
          {checklists.map((item) => (
            <li
              key={item._id}
              className="flex items-center gap-3 p-3 rounded-lg border"
              style={{ borderColor: 'rgba(226, 232, 240, 0.8)', backgroundColor: '#fff' }}
            >
              <input
                type="checkbox"
                checked={item.isCompleted}
                onChange={() => onToggleChecklist(item)}
                disabled={!canEdit}
                className="rounded border-slate-300 text-primary"
              />
              <span className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-slate-500' : ''}`} style={{ color: landingColors.text }}>
                {item.task}
              </span>
              <span className="text-xs capitalize" style={{ color: landingColors.textMuted }}>
                {item.category}
              </span>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onDeleteChecklistItem(item._id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
        {checklists.length === 0 && (
          <p className="text-sm" style={{ color: landingColors.textMuted }}>
            No checklist items yet.
          </p>
        )}
      </div>
    </div>
  );
}
