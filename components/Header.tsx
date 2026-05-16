import Link from 'next/link';
import type { Category } from '@/lib/types';

const NAV = [
  { label: 'All', href: '/', key: 'all' },
  { label: 'Ecosystem', href: '/ecosystem', key: 'ecosystem' },
  { label: 'Funding', href: '/funding', key: 'funding' },
  { label: 'Growth', href: '/growth', key: 'growth' },
  { label: 'Policy', href: '/policy', key: 'policy' },
] as const;

interface HeaderProps {
  activeCategory?: Category | 'all';
}

export function Header({ activeCategory = 'all' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-orange-500">
          🇮🇳 IndiBrief
        </Link>
        <nav className="flex gap-5 text-sm">
          {NAV.map(({ label, href, key }) => (
            <Link
              key={href}
              href={href}
              className={
                activeCategory === key
                  ? 'border-b border-orange-500 pb-0.5 text-orange-500'
                  : 'text-neutral-400 hover:text-neutral-100 transition-colors'
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
