import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import logoImg from '../assets/Logos/log.svg';
import darkLogoImg from '../assets/Logos/dark_logo.svg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const sizeMap = {
  sm: 'h-12 w-20 md:h-14 md:w-28 object-contain',
  md: 'h-16 w-24 md:h-20 md:w-48 object-contain',
  lg: 'h-20 w-32 md:h-24 md:w-56 object-contain',
};

export const Logo = ({ size = 'md', animated = true }: LogoProps) => {
  const { effectiveTheme } = useTheme();
  const Component = animated ? motion.div : 'div';
  const logoSrc = effectiveTheme === 'dark' ? darkLogoImg : logoImg;

  const animationProps = animated
    ? {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.5, ease: 'easeOut' as const },
      }
    : {};

  return (
    <Component {...animationProps} className="flex items-center gap-2">
      <div className="relative flex-shrink-0 flex items-center" style={{ minWidth: size === 'sm' ? 72 : size === 'lg' ? 128 : 96 }}>
        <img
          src={logoSrc}
          alt="coRoute"
          className={`${sizeMap[size]} object-left`}
          style={{ minWidth: size === 'sm' ? 72 : size === 'lg' ? 128 : 96 }}
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
