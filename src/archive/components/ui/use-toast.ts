"use client";

export type ToastOptions = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | (string & {});
};

export function toast(options: ToastOptions) {
  // Minimal stub to avoid build errors. Replace with a real toast system if desired.
  if (typeof window !== 'undefined') {
    const { title, description, variant } = options;
    // eslint-disable-next-line no-console
    console.log(`[toast:${variant ?? 'default'}]`, title ?? '', description ?? '');
  }
}

export function useToast() {
  return { toast };
}
