import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export function formatDate(timestamp: number): string {
  // If timestamp is in milliseconds (13 digits), use as is
  // If timestamp is in seconds (10 digits), multiply by 1000
  const timestampMs = timestamp.toString().length === 13 ? timestamp : timestamp * 1000;
  return new Date(timestampMs).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function isEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function isValidAccountId(id: string): boolean {
  return /^\d+$/.test(id)
}

// Note: Client-only hooks like useDebounce have been moved to src/lib/hooks.ts
