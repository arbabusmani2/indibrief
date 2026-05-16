import { generateSlug } from '../slugify';

describe('generateSlug', () => {
  it('kebab-cases the title', () => {
    const slug = generateSlug('Zepto Raises $350M Series F', 'https://yourstory.com/zepto');
    expect(slug).toMatch(/^zepto-raises-350m-series-f-[a-f0-9]{6}$/);
  });

  it('strips special characters', () => {
    const slug = generateSlug('SEBI new rules what it means', 'https://example.com/1');
    expect(slug).toMatch(/^sebi-new-rules-what-it-means-[a-f0-9]{6}$/);
  });

  it('truncates base to 60 chars before appending hash', () => {
    const longTitle = 'A'.repeat(80) + ' B';
    const slug = generateSlug(longTitle, 'https://example.com/2');
    const [base] = slug.split(/-[a-f0-9]{6}$/);
    expect(base.length).toBeLessThanOrEqual(60);
  });

  it('produces different slugs for same title but different URLs', () => {
    const slug1 = generateSlug('Same Title', 'https://a.com/1');
    const slug2 = generateSlug('Same Title', 'https://b.com/2');
    expect(slug1).not.toBe(slug2);
  });
});
