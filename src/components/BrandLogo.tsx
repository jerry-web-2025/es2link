import { Link2 } from 'lucide-react';
import { DARK_LOGO, LIGHT_LOGO, type Theme } from '@/lib/theme';

export function BrandLogo({ theme, compact = false }: { theme: Theme; compact?: boolean }) {
  return (
    <img
      src={theme === 'dark' ? DARK_LOGO : LIGHT_LOGO}
      alt="Es2LINK"
      className={compact ? 'h-9 w-9 rounded-xl object-contain' : 'h-10 w-auto max-w-[170px] rounded-xl object-contain'}
      onError={(event) => {
        const image = event.currentTarget;
        image.style.display = 'none';
        image.parentElement?.classList.add('brand-logo-fallback');
      }}
    />
  );
}

export function BrandMark({ theme }: { theme: Theme }) {
  return (
    <div className="brand-mark relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl" style={{ background: 'var(--primary)' }}>
      <BrandLogo theme={theme} compact />
      <Link2 size={17} className="brand-mark-fallback absolute text-white" aria-hidden="true" />
    </div>
  );
}
