'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/home', label: 'Matrix Operations' },
    { href: '/linear-regression', label: 'Linear Regression' },
    { href: '/knowledge-hub', label: 'Knowledge Hub' },
  ];

  return (
    <nav className="mb-6">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/80 p-1 shadow-sm transition-colors duration-200 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-900/40">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 min-w-[160px] rounded-xl px-4 py-2 text-center text-sm font-medium transition-[color,background,box-shadow,transform] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500/80'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
