import type { Article } from '../types';

const mockArticles: Article[] = [
  {
    slug: 'zepto-funding-abc123',
    title: 'Zepto raises $350M',
    summary: 'Zepto raised $350M.',
    category: 'funding',
    tags: ['zepto'],
    source: 'YourStory',
    sourceUrl: 'https://yourstory.com/zepto',
    publishedAt: '2026-05-16T08:00:00Z',
    ingestedAt: '2026-05-16T09:00:00Z',
  },
  {
    slug: 'meesho-growth-def456',
    title: 'Meesho hits 150M users',
    summary: 'Meesho reached 150M users.',
    category: 'ecosystem',
    tags: ['meesho'],
    source: 'Inc42',
    sourceUrl: 'https://inc42.com/meesho',
    publishedAt: '2026-05-16T06:00:00Z',
    ingestedAt: '2026-05-16T07:00:00Z',
  },
];

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => JSON.stringify(mockArticles)),
}));

import { getAllArticles, getArticlesByCategory, getArticleBySlug, getRelatedArticles } from '../articles';

describe('getAllArticles', () => {
  it('returns all articles', () => {
    expect(getAllArticles()).toHaveLength(2);
  });
});

describe('getArticlesByCategory', () => {
  it('returns only articles in the given category', () => {
    const results = getArticlesByCategory('funding');
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('zepto-funding-abc123');
  });

  it('returns empty array when no articles in category', () => {
    expect(getArticlesByCategory('policy')).toHaveLength(0);
  });
});

describe('getArticleBySlug', () => {
  it('returns the matching article', () => {
    const a = getArticleBySlug('zepto-funding-abc123');
    expect(a?.title).toBe('Zepto raises $350M');
  });

  it('returns undefined for unknown slug', () => {
    expect(getArticleBySlug('no-such-slug')).toBeUndefined();
  });
});

describe('getRelatedArticles', () => {
  it('returns articles in the same category, excluding the given article', () => {
    const target = mockArticles[0];
    const related = getRelatedArticles(target, 3);
    expect(related.every(a => a.category === 'funding')).toBe(true);
    expect(related.find(a => a.slug === target.slug)).toBeUndefined();
  });

  it('respects the limit', () => {
    const target = mockArticles[1];
    expect(getRelatedArticles(target, 1)).toHaveLength(0);
  });
});
