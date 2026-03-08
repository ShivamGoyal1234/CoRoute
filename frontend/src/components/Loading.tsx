import { motion } from 'framer-motion';
import loaderImg from '../assets/Logos/loader.svg';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

export const Loading = ({ fullScreen = false, message = 'Loading...' }: LoadingProps) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-app-bg z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="relative w-[180px] h-[180px] mb-8 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 flex items-center justify-center loader-glow-pulse loader-glow-wave"
        >
          <motion.img
            src={loaderImg}
            alt=""
            className="w-full h-full object-contain"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </div>
      <motion.p
        className="text-lg text-app-muted font-medium"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {message}
      </motion.p>
    </div>
  );
};
