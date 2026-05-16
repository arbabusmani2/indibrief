import Parser from 'rss-parser';
import type { Source } from '../../lib/types';

export interface RawArticle {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
}

// RSS image fields vary by publisher:
//   media:thumbnail — Yahoo Media RSS (most Indian news sites)
//   media:content   — same namespace, used by ET/Mint
//   enclosure       — old-school podcast standard, occasionally used
type CustomItem = {
  'media:thumbnail'?: { $?: { url?: string } } | string;
  'media:content'?:  { $?: { url?: string } } | string;
  enclosure?: { url?: string; type?: string };
};

const parser = new Parser<Record<string, unknown>, CustomItem>({
  timeout: 10_000,
  customFields: {
    item: ['media:thumbnail', 'media:content'],
  },
});

function extractImage(item: CustomItem): string | undefined {
  const thumb = item['media:thumbnail'];
  if (thumb && typeof thumb === 'object' && thumb.$?.url) return thumb.$.url;

  const content = item['media:content'];
  if (content && typeof content === 'object' && content.$?.url) return content.$.url;

  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }

  return undefined;
}

export async function fetchFeeds(sources: Source[]): Promise<RawArticle[]> {
  const results = await Promise.allSettled(sources.map(s => fetchFeed(s)));
  const items: RawArticle[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      items.push(...r.value);
    } else {
      console.warn(`[fetchFeeds] Skipping ${sources[i].name}: ${r.reason}`);
    }
  }
  return items;
}

async function fetchFeed(source: Source): Promise<RawArticle[]> {
  const feed = await parser.parseURL(source.url);
  return (feed.items ?? [])
    .filter(item => item.link || item.guid)
    .map(item => ({
      url: (item.link ?? item.guid) as string,
      title: item.title ?? '',
      description: item.contentSnippet ?? item.summary ?? item.content ?? '',
      imageUrl: extractImage(item),
      source: source.name,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    }));
}
