import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Category } from '@/lib/types';

const NAV = [
  { label: 'All',       href: '/',         key: 'all' },
  { label: 'Ecosystem', href: '/ecosystem', key: 'ecosystem' },
  { label: 'Funding',   href: '/funding',   key: 'funding' },
  { label: 'Growth',    href: '/growth',    key: 'growth' },
  { label: 'Policy',    href: '/policy',    key: 'policy' },
] as const;

interface HeaderProps {
  activeCategory?: Category | 'all';
}

export function Header({ activeCategory = 'all' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4">
        {/* Brand row */}
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-orange-500">IndiBrief</span>
            <span className="hidden sm:inline text-xs text-neutral-500 dark:text-neutral-500 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-0.5">
              Indian Startup News
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/arbabusmani2/indibrief"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-400 transition-colors"
            >
              Open source ↗
            </a>
            <ThemeToggle />
          </div>
        </div>
        {/* Category nav */}
        <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-none">
          {NAV.map(({ label, href, key }) => (
            <Link
              key={href}
              href={href}
              className={
                activeCategory === key
                  ? 'px-3 py-2 text-sm font-medium text-orange-500 border-b-2 border-orange-500 whitespace-nowrap'
                  : 'px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap border-b-2 border-transparent'
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
