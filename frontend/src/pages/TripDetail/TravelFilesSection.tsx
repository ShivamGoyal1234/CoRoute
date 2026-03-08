import { useLandingColors } from '../../landing/theme';

export function TravelFilesSection() {
  const colors = useLandingColors();
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-6 w-full">
      <div className="rounded-xl border p-8 text-center" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
        <p style={{ color: colors.textMuted }}>Travel files and documents will appear here.</p>
        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
          Coming soon.
        </p>
      </div>
    </div>
  );
}
