import crypto from 'crypto';

export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}

export function isNewUrl(url: string, seen: Record<string, boolean>): boolean {
  return !seen[hashUrl(url)];
}

export function addToSeen(urls: string[], seen: Record<string, boolean>): Record<string, boolean> {
  const updated = { ...seen };
  for (const url of urls) {
    updated[hashUrl(url)] = true;
  }
  return updated;
}
