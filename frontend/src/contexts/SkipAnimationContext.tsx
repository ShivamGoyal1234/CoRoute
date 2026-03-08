import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTheme } from './ThemeContext';

const SkipAnimationContext = createContext(false);

export function useSkipAnimation() {
  return useContext(SkipAnimationContext);
}

export function SkipAnimationProvider({ children }: { children: ReactNode }) {
  const { effectiveTheme } = useTheme();
  const prevThemeRef = useRef<string | null>(null);
  const [skipAnimations, setSkipAnimations] = useState(false);

  useEffect(() => {
    if (prevThemeRef.current !== null && prevThemeRef.current !== effectiveTheme) {
      setSkipAnimations(true);
    }
    prevThemeRef.current = effectiveTheme;
  }, [effectiveTheme]);

  return (
    <SkipAnimationContext.Provider value={skipAnimations}>
      {children}
    </SkipAnimationContext.Provider>
  );
}
