import { Link } from 'react-router-dom';
import { Logo, ThemeToggle } from '../../components';
import type { useLandingColors } from '../theme';
import { footerLinks } from '../data';

type Colors = ReturnType<typeof useLandingColors>;

export function LandingFooter({ colors }: { colors: Colors }) {
  return (
    <footer className="border-t" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-8">
          <div className="max-w-xs">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <Logo size="sm" animated={false} />
            </Link>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>
              SHARED PATHS
            </p>
            <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
              Shared Paths, Seamless Plans. Experience the future of collaborative exploration.
            </p>
          </div>
          <div className="flex flex-wrap gap-32 md:gap-44">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>{heading}</h4>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="text-sm hover:opacity-80 transition-opacity" style={{ color: colors.textMuted }}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderColor: colors.border }}>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            © {new Date().getFullYear()} CoRoute Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <button type="button" className="p-1 rounded hover:opacity-70 transition-opacity" aria-label="Language" style={{ color: colors.textMuted }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </button>
            <button type="button" className="p-1 rounded hover:opacity-70 transition-opacity" aria-label="Region" style={{ color: colors.textMuted }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button type="button" className="p-1 rounded hover:opacity-70 transition-opacity" aria-label="Account" style={{ color: colors.textMuted }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
