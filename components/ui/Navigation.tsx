'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/home', label: 'Matrix Operations' },
    { href: '/linear-regression', label: 'Linear Regression' },
  ];

  return (
    <nav className="mb-6 border-b border-zinc-300 dark:border-zinc-700 pb-4">
      <div className="flex gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 font-medium transition-colors rounded-lg ${
              pathname === item.href
                ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
