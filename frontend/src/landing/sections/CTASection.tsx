import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSkipAnimation } from '../../contexts/SkipAnimationContext';
import type { useLandingColors } from '../theme';

export function CTASection({ colors }: { colors: ReturnType<typeof useLandingColors> }) {
  const skip = useSkipAnimation();
  return (
    <section id="cta" className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <motion.div
        initial={skip ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-3xl px-8 md:px-12 py-12 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8 text-white overflow-hidden"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <svg
            className="absolute bottom-0 left-0 w-[200%] h-full min-h-[200px] opacity-20"
            style={{ animation: 'wave 8s ease-in-out infinite' }}
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path fill="rgba(255,255,255,0.4)" d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" />
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-[200%] h-full min-h-[200px] opacity-20"
            style={{ animation: 'wave 10s ease-in-out infinite reverse', animationDelay: '-2s' }}
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path fill="rgba(255,255,255,0.3)" d="M0,80 C300,20 500,100 800,50 C1000,90 1100,30 1200,70 L1200,120 L0,120 Z" />
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-[200%] h-full min-h-[180px] opacity-15"
            style={{ animation: 'wave 12s ease-in-out infinite', animationDelay: '-4s' }}
            preserveAspectRatio="none"
            viewBox="0 0 1200 100"
          >
            <path fill="rgba(255,255,255,0.35)" d="M0,50 C200,100 400,0 600,50 C800,100 1000,0 1200,50 L1200,100 L0,100 Z" />
          </svg>
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Ready for your next big trip?</h2>
          <p className="text-white/90 text-lg max-w-xl">
            Join thousands of travelers who have made planning half the fun.
          </p>
        </div>
        <div className="relative z-10 flex justify-center md:justify-end shrink-0">
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold bg-white transition-opacity hover:opacity-95 shadow-md"
            style={{ color: colors.primaryHeader }}
          >
            Start Planning Now
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
