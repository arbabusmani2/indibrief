import { hashUrl, isNewUrl, addToSeen } from '../dedup';

describe('hashUrl', () => {
  it('returns a consistent hex string for a URL', () => {
    const h = hashUrl('https://example.com/article');
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(hashUrl('https://example.com/article')).toBe(h);
  });

  it('returns different hashes for different URLs', () => {
    expect(hashUrl('https://a.com')).not.toBe(hashUrl('https://b.com'));
  });
});

describe('isNewUrl', () => {
  it('returns true when URL hash is not in seen', () => {
    expect(isNewUrl('https://new.com', {})).toBe(true);
  });

  it('returns false when URL hash is already in seen', () => {
    const seen = addToSeen(['https://seen.com'], {});
    expect(isNewUrl('https://seen.com', seen)).toBe(false);
  });
});

describe('addToSeen', () => {
  it('adds hashes of all provided URLs', () => {
    const seen = addToSeen(['https://a.com', 'https://b.com'], {});
    expect(isNewUrl('https://a.com', seen)).toBe(false);
    expect(isNewUrl('https://b.com', seen)).toBe(false);
    expect(isNewUrl('https://c.com', seen)).toBe(true);
  });

  it('does not mutate the original seen object', () => {
    const original = {};
    addToSeen(['https://a.com'], original);
    expect(Object.keys(original)).toHaveLength(0);
  });
});
