import { motion } from 'framer-motion';
import logoImg from '../assets/logo.svg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const sizeMap = {
  sm: 'h-8 w-auto max-w-12',
  md: 'h-12 w-auto max-w-20',
  lg: 'h-16 w-auto max-w-28',
};

export const Logo = ({ size = 'md', animated = true }: LogoProps) => {
  const Component = animated ? motion.div : 'div';

  const animationProps = animated
    ? {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.5, ease: 'easeOut' as const },
      }
    : {};

  return (
    <Component {...animationProps} className="flex items-center gap-2">
      <div className="relative flex-shrink-0 flex items-center" style={{ minWidth: size === 'sm' ? 48 : size === 'lg' ? 112 : 80 }}>
        <img
          src={logoImg}
          alt="coRoute"
          className={`${sizeMap[size]} object-contain object-left`}
          style={{ minWidth: size === 'sm' ? 48 : size === 'lg' ? 112 : 80 }}
        />
      </div>
      <motion.span
        className="font-bold text-xl bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
        initial={animated ? { opacity: 0, x: -10 } : undefined}
        animate={animated ? { opacity: 1, x: 0 } : undefined}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        coRoute
      </motion.span>
    </Component>
  );
};
