import { motion } from 'framer-motion';
import { useSkipAnimation } from '../../contexts/SkipAnimationContext';
import type { useLandingColors } from '../theme';
import { trustedByBrands } from '../data';

export function TrustedBySection({ colors }: { colors: ReturnType<typeof useLandingColors> }) {
  const skip = useSkipAnimation();
  const row1 = trustedByBrands.slice(0, 5);
  const row2 = trustedByBrands.slice(5, 10);

  return (
    <section
      className="w-full py-16 md:py-24 overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-6xl mx-auto px-4 mb-12 md:mb-14">
        <motion.div
          initial={skip ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center mb-3"
        >
          <span
            className="inline-block h-0.5 w-14 mr-4"
            style={{ backgroundColor: colors.primary, minWidth: '3.5rem' }}
            aria-hidden="true"
          />
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: colors.primary }}
          >
            Trusted by travelers
          </span>
        </motion.div>
        <motion.h2
          initial={skip ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-3xl md:text-4xl font-bold text-center tracking-tight"
          style={{ color: colors.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Trusted by the world&apos;s most organized travelers
        </motion.h2>
      </div>

      <div className="space-y-4">
        {[row1, row2].map((brands, rowIndex) => (
          <div key={rowIndex} className="relative">
            <div
              className="absolute left-0 top-0 bottom-0 w-20 md:w-28 z-10 pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${colors.background}, transparent)`,
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-20 md:w-28 z-10 pointer-events-none"
              style={{
                background: `linear-gradient(to left, ${colors.background}, transparent)`,
              }}
            />
            <div className="overflow-hidden">
              <div
                className={`flex w-max ${rowIndex === 1 ? 'animate-marquee-reverse' : 'animate-marquee'}`}
              >
                {[...brands, ...brands].map((brand, i) => (
                  <div
                    key={`${brand}-${rowIndex}-${i}`}
                    className="flex-shrink-0 flex items-center gap-6 md:gap-10 px-6 md:px-10 h-14"
                  >
                    <span
                      className="text-base md:text-xl font-medium tracking-tight whitespace-nowrap transition-opacity duration-300 hover:opacity-100"
                      style={{
                        color: colors.textMuted,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        opacity: 0.75,
                      }}
                    >
                      {brand}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
