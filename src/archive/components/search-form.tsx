'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isValidAccountId } from '@/lib/utils';
import { SearchIcon } from 'lucide-react';

export function SearchForm() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query')?.toString().trim();

    if (!query) return;

    // Remove any query string or slashes
    const cleanQuery = query.replace(/[?/]/g, '');

    // If it's an account ID, first get the wallet address
    if (isValidAccountId(cleanQuery)) {
      try {
        const response = await fetch(`/api/wallet-by-account/${cleanQuery}`);
        if (!response.ok) {
          throw new Error('Failed to fetch wallet address');
        }
        const data = await response.json();
        if (data.wallet) {
          router.push(`/accounts/${data.wallet}/${cleanQuery}`);
          return;
        }
      } catch (error) {
        console.error('Error fetching wallet address:', error);
      }
    }

    // If it's an Ethereum address or wallet lookup failed, just go to the wallet page
    router.push(`/accounts/${cleanQuery}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          name="query"
          placeholder="Search address or account ID..."
          className="pl-8"
        />
      </div>
      <Button type="submit" size="sm">
        Search
      </Button>
    </form>
  );
}
