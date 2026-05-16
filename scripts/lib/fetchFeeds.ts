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

// RSS image extraction strategy (in priority order):
//   1. media:thumbnail / media:content — Yahoo/standard media namespace
//   2. enclosure — podcast-style image attachment
//   3. webfeedsFeaturedVisual img — WordPress featured image embedded in content:encoded HTML
//      (used by Inc42, YourStory, ET Startups, and most Indian news WordPress sites)
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

/** Extract first <img src> from HTML, preferring WordPress featured image class */
function extractImageFromHtml(html: string): string | undefined {
  // WordPress featured image comes first in description/content:encoded
  // Attribute order varies: src may come before or after class
  const patterns = [
    // src before class
    /<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*webfeedsFeaturedVisual[^"']*["']/i,
    // class before src
    /<img[^>]+class=["'][^"']*webfeedsFeaturedVisual[^"']*["'][^>]+src=["']([^"']+)["']/i,
    // fallback: any first img src (skip data URIs and tiny icons)
    /<img[^>]+src=["'](https?:\/\/[^"']{20,})["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1];
  }
  return undefined;
}

function extractImage(item: CustomItem & { content?: string }): string | undefined {
  // 1. media:thumbnail
  const thumb = item['media:thumbnail'];
  if (thumb && typeof thumb === 'object' && thumb.$?.url) return thumb.$.url;

  // 2. media:content
  const mc = item['media:content'];
  if (mc && typeof mc === 'object' && mc.$?.url) return mc.$.url;

  // 3. enclosure
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }

  // 4. HTML content (WordPress / most Indian news sites)
  if (item.content) return extractImageFromHtml(item.content);

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
      // contentSnippet is the plain-text version (HTML stripped by rss-parser)
      description: item.contentSnippet ?? item.summary ?? '',
      imageUrl: extractImage(item as CustomItem & { content?: string }),
      source: source.name,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    }));
}
