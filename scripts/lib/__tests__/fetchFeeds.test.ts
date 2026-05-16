import { fetchFeeds } from '../fetchFeeds';
import type { Source } from '../../../lib/types';

jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => ({
    parseURL: jest.fn().mockImplementation((url: string) => {
      if (url === 'https://fail.com/feed') throw new Error('Network error');
      return Promise.resolve({
        items: [
          { link: `${url}/article-1`, title: 'Test Article 1', contentSnippet: 'A description.', pubDate: 'Fri, 16 May 2026 08:00:00 GMT' },
          { link: `${url}/article-2`, title: 'Test Article 2', contentSnippet: 'Another description.', pubDate: 'Fri, 16 May 2026 07:00:00 GMT' },
        ],
      });
    }),
  }));
});

const sources: Source[] = [
  { name: 'SourceA', url: 'https://a.com/feed' },
  { name: 'SourceB', url: 'https://b.com/feed' },
];

describe('fetchFeeds', () => {
  it('returns articles from all sources', async () => {
    const items = await fetchFeeds(sources);
    expect(items).toHaveLength(4);
  });

  it('each item has url, title, description, source, publishedAt', async () => {
    const items = await fetchFeeds(sources);
    const item = items[0];
    expect(item.url).toBe('https://a.com/feed/article-1');
    expect(item.title).toBe('Test Article 1');
    expect(item.description).toBe('A description.');
    expect(item.source).toBe('SourceA');
    expect(item.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('skips a failing feed and returns results from others', async () => {
    const sourcesWithFailure: Source[] = [
      { name: 'Good', url: 'https://a.com/feed' },
      { name: 'Bad', url: 'https://fail.com/feed' },
    ];
    const items = await fetchFeeds(sourcesWithFailure);
    expect(items).toHaveLength(2);
    expect(items.every(i => i.source === 'Good')).toBe(true);
  });
});
