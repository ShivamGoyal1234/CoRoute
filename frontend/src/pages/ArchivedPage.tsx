import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useLandingColors } from '../landing/theme';

export default function ArchivedPage() {
  const colors = useLandingColors();
  const { effectiveTheme } = useTheme();
  const emptyCardBg = effectiveTheme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(236, 229, 249, 0.6)';
  const emptyCardBorder = effectiveTheme === 'dark' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.4)';

  return (
    <div
      className="min-h-screen rounded-2xl"
      style={{ backgroundColor: colors.background }}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: colors.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Archived
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: colors.textMuted }}
          >
            Trips you’ve archived. They won’t appear in My Trips.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border-2 border-dashed p-12 text-center"
          style={{
            borderColor: emptyCardBorder,
            backgroundColor: emptyCardBg,
          }}
        >
          <p className="mb-4" style={{ color: colors.textMuted }}>
            No archived trips. When you archive a trip from My Trips, it will show up here.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95"
            style={{
              backgroundColor: colors.primary,
              boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3)',
            }}
          >
            Back to My Trips
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
