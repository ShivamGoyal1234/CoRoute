import { motion } from 'framer-motion';
import { useSkipAnimation } from '../../contexts/SkipAnimationContext';
import type { useLandingColors } from '../theme';
import { features } from '../data';

export function FeaturesSection({ colors }: { colors: ReturnType<typeof useLandingColors> }) {
  const skip = useSkipAnimation();
  return (
    <section id="features" className="w-full py-16 md:py-24" style={{ backgroundColor: colors.surface }}>
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={skip ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 px-2"
          style={{ color: colors.text }}
        >
          Everything You Need for Your Next <br className="hidden sm:block" /> Adventure
        </motion.h2>
        <motion.p
          initial={skip ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 px-2 text-sm sm:text-base"
          style={{ color: colors.textMuted }}
        >
          We've built the most comprehensive toolkit for travelers who love to
          <br className="hidden sm:block" /> coordinate without the stress of messy group chats.
        </motion.p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={skip ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: colors.headerBg, borderColor: colors.border }}
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
      </div>
    </section>
  );
}
