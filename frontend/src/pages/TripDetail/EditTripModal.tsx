import { useLandingColors } from '../../landing/theme';

interface EditTripModalProps {
  isOpen: boolean;
  title: string;
  onTitleChange: (v: string) => void;
  destination: string;
  onDestinationChange: (v: string) => void;
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
  totalBudget: string;
  onTotalBudgetChange: (v: string) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function EditTripModal({
  isOpen,
  title,
  onTitleChange,
  destination,
  onDestinationChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  currency,
  onCurrencyChange,
  totalBudget,
  onTotalBudgetChange,
  onSave,
  onClose,
}: EditTripModalProps) {
  const colors = useLandingColors();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={onSave}
        className="rounded-xl border p-6 w-full max-w-md shadow-xl space-y-3 max-h-[90vh] overflow-y-auto"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <h2 className="font-semibold text-lg" style={{ color: colors.text }}>Edit trip</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Trip title"
          required
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
        />
        <div>
          <input
            type="text"
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            placeholder="Where are you going? (city, country or region)"
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
          />
          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
            Used for the map on dashboard and trip detail.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            required
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            required
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
            <option value="JPY">JPY</option>
          </select>
          <input
            type="number"
            min={0}
            step={0.01}
            value={totalBudget}
            onChange={(e) => onTotalBudgetChange(e.target.value)}
            placeholder="Total budget"
            className="w-32 px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: colors.primary }}>
            Save
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: colors.border, color: colors.text }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
