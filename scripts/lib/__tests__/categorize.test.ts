import { categorize } from '../categorize';

describe('categorize', () => {
  it('detects funding from title keywords', () => {
    expect(categorize('Zepto raises $350M Series F', '')).toBe('funding');
    expect(categorize('Jar raises fresh round at valuation', '')).toBe('funding');
    expect(categorize('CRED secures investment from Tiger Global', '')).toBe('funding');
  });
  it('detects policy from title keywords', () => {
    expect(categorize('SEBI tightens angel fund rules', '')).toBe('policy');
    expect(categorize('RBI issues new UPI regulation', '')).toBe('policy');
    expect(categorize('Government launches scheme for startups', '')).toBe('policy');
  });
  it('detects growth from title keywords', () => {
    expect(categorize('Meesho hits 150M users revenue up', '')).toBe('growth');
    expect(categorize('Blinkit GMV crosses crore mark', '')).toBe('growth');
    expect(categorize('PhonePe reaches profitability milestone', '')).toBe('growth');
  });
  it('detects marketing from title keywords', () => {
    expect(categorize('Google rolls out new SEO ranking signals', '')).toBe('marketing');
    expect(categorize('Why brands are shifting ad spend to retail media', '')).toBe('marketing');
    expect(categorize('The state of influencer campaigns in 2026', '')).toBe('marketing');
  });
  it('falls back to ecosystem for startup sources', () => {
    expect(categorize('Ola launches new product line', '')).toBe('ecosystem');
    expect(categorize('Ola launches new product line', '', 'Inc42')).toBe('ecosystem');
  });
  it('falls back to marketing for marketing publications', () => {
    expect(categorize('Netflix unveils new ad-supported tier', '', 'Digiday')).toBe('marketing');
    expect(categorize('What publishers learned this year', '', 'Search Engine Land')).toBe('marketing');
  });
  it('matches on word starts, not substrings', () => {
    // 'android' must not match 'roi', 'electric' must not match 'ctr'
    expect(categorize('Android app launch by Ola', '')).toBe('ecosystem');
    expect(categorize('Electric vehicle maker unveils scooter', '')).toBe('ecosystem');
  });
  it('checks description when title has no match', () => {
    expect(categorize('Startup news', 'Company announced a new funding round led by Sequoia')).toBe('funding');
  });
  it('title match takes priority over description', () => {
    expect(categorize('SEBI issues new rules', 'revenue grew 200% this quarter')).toBe('policy');
  });
});
