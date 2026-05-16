import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fetchFeeds } from './lib/fetchFeeds';
import { isNewUrl, addToSeen } from './lib/dedup';
import { categorize } from './lib/categorize';
import { generateSlug } from './lib/slugify';
import type { Article, Source } from '../lib/types';

const ROOT = path.join(__dirname, '..');
const ARTICLES_PATH = path.join(ROOT, 'data/articles.json');
const SEEN_PATH = path.join(ROOT, 'data/seen.json');
const SOURCES_PATH = path.join(ROOT, 'config/sources.json');
const BATCH_CAP = 50;
const STORE_CAP = 500;

async function main() {
  const sources: Source[] = JSON.parse(readFileSync(SOURCES_PATH, 'utf-8'));
  const seen: Record<string, boolean> = JSON.parse(readFileSync(SEEN_PATH, 'utf-8'));
  const existing: Article[] = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'));

  const rawItems = await fetchFeeds(sources);
  const newItems = rawItems.filter(item => isNewUrl(item.url, seen)).slice(0, BATCH_CAP);

  if (newItems.length === 0) {
    console.log('[ingest] No new articles. Exiting.');
    process.exit(0);
  }

  console.log(`[ingest] Processing ${newItems.length} new articles...`);
  const now = new Date().toISOString();

  const newArticles: Article[] = newItems.map(item => ({
    slug: generateSlug(item.title, item.url),
    title: item.title,
    summary: item.description,
    category: categorize(item.title, item.description),
    tags: [],
    source: item.source,
    sourceUrl: item.url,
    publishedAt: item.publishedAt,
    ingestedAt: now,
  }));

  const merged = [...newArticles, ...existing]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, STORE_CAP);

  writeFileSync(ARTICLES_PATH, JSON.stringify(merged, null, 2));
  writeFileSync(SEEN_PATH, JSON.stringify(addToSeen(newItems.map(i => i.url), seen), null, 2));
  console.log(`[ingest] Done. Wrote ${newArticles.length} articles (${merged.length} total).`);
}

main().catch(err => { console.error('[ingest] Fatal:', err); process.exit(1); });
