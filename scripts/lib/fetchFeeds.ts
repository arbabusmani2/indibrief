import Parser from 'rss-parser';
import type { Source } from '../../lib/types';

export interface RawArticle {
  url: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
}

const parser = new Parser({ timeout: 10_000 });

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
      source: source.name,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    }));
}
