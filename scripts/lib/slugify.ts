import crypto from 'crypto';

export function generateSlug(title: string, url: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
    .replace(/-+$/, '');

  const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 6);
  return `${base}-${hash}`;
}
