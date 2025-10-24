'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { signOut, useSession } from 'next-auth/react';
import { SearchForm } from './search-form';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (!session) return null;

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4 flex-1">
          <Link
            href="/"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              isActive('/') ? 'text-black' : 'text-muted-foreground'
            )}
          >
            Trades
          </Link>
          <Link
            href="/positions"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              isActive('/positions') ? 'text-black' : 'text-muted-foreground'
            )}
          >
            Open Positions
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4 max-w-sm">
          <SearchForm />
          <Button
            variant="ghost"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
