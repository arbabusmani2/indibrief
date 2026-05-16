import { readFileSync } from 'fs';
import path from 'path';
import type { Article, Category } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

function load(): Article[] {
  return JSON.parse(readFileSync(path.join(process.cwd(), 'data/articles.json'), 'utf-8'));
}

export function getAllArticles(): Article[] {
  return load();
}

/** Articles ingested within the last 24 hours — shown on the homepage */
export function getTodayArticles(): Article[] {
  const cutoff = Date.now() - DAY_MS;
  return load().filter(a => new Date(a.ingestedAt).getTime() >= cutoff);
}

/** Articles ingested more than 24 hours ago — shown on the archive page */
export function getArchiveArticles(): Article[] {
  const cutoff = Date.now() - DAY_MS;
  return load().filter(a => new Date(a.ingestedAt).getTime() < cutoff);
}

export function getArticlesByCategory(category: Category): Article[] {
  return load().filter(a => a.category === category);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return load().find(a => a.slug === slug);
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return load()
    .filter(a => a.category === article.category && a.slug !== article.slug)
    .slice(0, limit);
}
