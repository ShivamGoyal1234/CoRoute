import { useLandingColors } from '../../landing/theme';

interface EditBudgetModalProps {
  isOpen: boolean;
  currency: string;
  onCurrencyChange: (v: string) => void;
  totalBudget: string;
  onTotalBudgetChange: (v: string) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function EditBudgetModal({
  isOpen,
  currency,
  onCurrencyChange,
  totalBudget,
  onTotalBudgetChange,
  onSave,
  onClose,
}: EditBudgetModalProps) {
  const colors = useLandingColors();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={onSave}
        className="rounded-xl border p-6 w-full max-w-md shadow-xl space-y-3"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <h2 className="font-semibold text-lg" style={{ color: colors.text }}>
          Edit budget
        </h2>
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
            className="flex-1 min-w-32 px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
