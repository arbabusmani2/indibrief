'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Silently refreshes server component data every hour.
 * Uses router.refresh() — no visible page reload, just new data from the server.
 */
export function AutoRefresh({ intervalMs = 60 * 60 * 1000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
