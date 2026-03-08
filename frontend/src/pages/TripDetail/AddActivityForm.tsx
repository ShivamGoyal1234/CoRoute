import { useLandingColors } from '../../landing/theme';

interface AddActivityFormProps {
  title: string;
  onTitleChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  location: string;
  onLocationChange: (v: string) => void;
  startTime: string;
  onStartTimeChange: (v: string) => void;
  imageUrl: string;
  onImageUrlChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function AddActivityForm({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  location,
  onLocationChange,
  startTime,
  onStartTimeChange,
  imageUrl,
  onImageUrlChange,
  onSubmit,
  onCancel,
}: AddActivityFormProps) {
  const colors = useLandingColors();
  return (
    <form onSubmit={onSubmit} className="relative flex gap-4 pt-2 pb-6">
      <div className="w-6 shrink-0" />
      <div
        className="flex-1 rounded-xl border p-4 space-y-3"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Title *</label>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Arrive at Narita International"
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="e.g. Transfer to Shinjuku via Narita Express"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
            style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Location</label>
            <input
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="e.g. Shibuya City, Tokyo"
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: colors.textMuted }}>Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#7859F8' }}>
            Add Activity
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border text-sm" style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
