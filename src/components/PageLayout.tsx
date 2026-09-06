import { type ReactNode } from 'react';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { useTheme, type Theme } from '@/lib/theme';
import { BrandLogo } from '@/components/BrandLogo';

export function PageLayout({
  theme,
  onToggleTheme,
  title,
  children,
}: {
  theme: Theme;
  onToggleTheme: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ borderColor: 'var(--border)', background: 'var(--header-bg)' }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            onClick={() => { window.location.hash = ''; }}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            aria-label="Back to Es2LINK home"
          >
            <BrandLogo theme={theme} compact />
          </button>
          <button
            onClick={onToggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--btn-ghost-bg)]"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <button
          onClick={() => { window.location.hash = ''; }}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--primary)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          Back to Es2LINK
        </button>

        <div className="mb-10 flex items-center gap-3">
          <BrandLogo theme={theme} compact />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        </div>

        <div className="space-y-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {children}
        </div>
      </main>

      <footer className="mt-12 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <BrandLogo theme={theme} compact />
              <span className="text-sm font-semibold tracking-tight">Es2LINK</span>
            </div>
            <nav className="flex items-center gap-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <a href="#/privacy" className="transition-colors hover:text-[var(--primary)]">Privacy</a>
              <a href="#/terms" className="transition-colors hover:text-[var(--primary)]">Terms</a>
              <a href="#/contact" className="transition-colors hover:text-[var(--primary)]">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function usePageTheme() {
  return useTheme();
}
