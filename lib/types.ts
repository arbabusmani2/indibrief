// lib/types.ts
export type Category = 'ecosystem' | 'funding' | 'growth' | 'policy';

export interface Article {
  slug: string;
  title: string;
  summary: string;
  category: Category;
  tags: string[];
  source: string;
  sourceUrl: string;
  publishedAt: string; // ISO 8601
  ingestedAt: string;  // ISO 8601
}

export interface Source {
  name: string;
  url: string;
}
