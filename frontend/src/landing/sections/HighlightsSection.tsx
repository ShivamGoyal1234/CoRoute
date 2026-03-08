import { motion } from 'framer-motion';
import { useSkipAnimation } from '../../contexts/SkipAnimationContext';
import type { useLandingColors } from '../theme';
import { featuresHighlights } from '../data';

export function HighlightsSection({ colors }: { colors: ReturnType<typeof useLandingColors> }) {
  const skip = useSkipAnimation();
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 md:py-24" style={{ backgroundColor: colors.background }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuresHighlights.map((f, i) => (
          <motion.div
            key={f.title}
            initial={skip ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
            >
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
