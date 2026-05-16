import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://indibrief.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const staticRoutes: MetadataRoute.Sitemap = [
    '/', '/ecosystem', '/funding', '/growth', '/policy', '/about', '/sources',
  ].map(path => ({ url: `${BASE}${path}`, lastModified: new Date() }));
  const articleRoutes: MetadataRoute.Sitemap = articles.map(a => ({
    url: `${BASE}/article/${a.slug}`,
    lastModified: new Date(a.publishedAt),
  }));
  return [...staticRoutes, ...articleRoutes];
}
