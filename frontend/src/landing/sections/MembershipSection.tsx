import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSkipAnimation } from '../../contexts/SkipAnimationContext';
import type { useLandingColors } from '../theme';
import { memberships } from '../data';

export function MembershipSection({ colors }: { colors: ReturnType<typeof useLandingColors> }) {
  const skip = useSkipAnimation();
  return (
    <section
      id="pricing"
      className="w-full py-16 md:py-24 overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-6xl mx-auto px-4">
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
            Membership
          </span>
        </motion.div>
        <motion.h2
          initial={skip ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 tracking-tight px-2"
          style={{ color: colors.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Simple, transparent pricing
        </motion.h2>
        <motion.p
          initial={skip ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-xl mx-auto mb-12 md:mb-16"
          style={{ color: colors.textMuted }}
        >
          Choose the plan that fits how you travel. Upgrade or downgrade anytime.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {memberships.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={skip ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
              style={{
                backgroundColor: colors.surface,
                borderColor: tier.popular ? colors.primary : colors.border,
                borderWidth: tier.popular ? 2 : 1,
              }}
            >
              {tier.popular && (
                <div
                  className="absolute top-6 right-[-32px] w-36 rotate-45 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: colors.primary }}
                  aria-hidden
                >
                  Most Popular
                </div>
              )}
              <div className="p-6 md:p-8 flex flex-col h-full">
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{
                    color: tier.popular ? colors.primary : colors.textMuted,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="text-3xl md:text-4xl font-extrabold tracking-tight"
                    style={{ color: colors.text }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm font-medium" style={{ color: colors.textMuted }}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                  {tier.description}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <svg
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: colors.success }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span style={{ color: colors.text }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="block w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200"
                  style={
                    tier.popular
                      ? {
                          backgroundColor: colors.primary,
                          color: 'white',
                          boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.35)',
                        }
                      : {
                          borderWidth: 2,
                          borderStyle: 'solid',
                          borderColor: colors.border,
                          color: colors.text,
                          backgroundColor: 'transparent',
                        }
                  }
                >
                  {tier.ctaText}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
