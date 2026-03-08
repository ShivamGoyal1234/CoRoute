import { motion } from 'framer-motion';
import { useSkipAnimation } from '../../contexts/SkipAnimationContext';
import type { useLandingColors } from '../theme';
import { testimonials } from '../data';

function StarIcon({ color }: { color: string }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

export function TestimonialsSection({ colors }: { colors: ReturnType<typeof useLandingColors> }) {
  const skip = useSkipAnimation();
  return (
    <section className="w-full py-16 md:py-24" style={{ backgroundColor: colors.surface }}>
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={skip ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-4"
          style={{ color: colors.text }}
        >
          Travelers love CoRoute
        </motion.h2>
        <motion.p
          initial={skip ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-base md:text-lg mb-12 max-w-2xl mx-auto"
          style={{ color: colors.textMuted }}
        >
          From weekend getaways to month-long backpacking treks, see how groups are ditching the spreadsheets and finding their rhythm together.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={skip ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: colors.headerBg, borderColor: colors.border }}
            >
              <div className="flex gap-0.5 mb-4" aria-label="5 stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} color={colors.secondary} />
                ))}
              </div>
              <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: colors.text }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={
                    [
                      "https://randomuser.me/api/portraits/women/75.jpg",
                      "https://randomuser.me/api/portraits/men/42.jpg",
                      "https://randomuser.me/api/portraits/men/77.jpg",
                    ][i % 3]
                  }
                  alt={t.name}
                  className="w-10 h-10 rounded-full flex-shrink-0 object-cover border"
                  style={{ backgroundColor: colors.border, borderColor: colors.border }}
                  aria-hidden="true"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-sm" style={{ color: colors.text }}>{t.name}</p>
                  <p className="text-xs" style={{ color: colors.textMuted }}>{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
