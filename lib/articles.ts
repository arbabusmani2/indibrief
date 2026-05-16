import { readFileSync } from 'fs';
import path from 'path';
import type { Article, Category } from './types';

function load(): Article[] {
  return JSON.parse(readFileSync(path.join(process.cwd(), 'data/articles.json'), 'utf-8'));
}

export function getAllArticles(): Article[] {
  return load();
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
