import { landingColors } from '../../landing/theme';

export function TravelFilesSection() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-6 w-full">
      <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'rgba(226, 232, 240, 0.8)', backgroundColor: '#fff' }}>
        <p className="text-slate-500 dark:text-slate-400">Travel files and documents will appear here.</p>
        <p className="text-sm mt-1" style={{ color: landingColors.textMuted }}>
          Coming soon.
        </p>
      </div>
    </div>
  );
}
