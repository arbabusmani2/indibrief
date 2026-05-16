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
  it('falls back to ecosystem', () => {
    expect(categorize('Ola launches new product line', '')).toBe('ecosystem');
  });
  it('checks description when title has no match', () => {
    expect(categorize('Startup news', 'Company announced a new funding round led by Sequoia')).toBe('funding');
  });
  it('title match takes priority over description', () => {
    expect(categorize('SEBI issues new rules', 'revenue grew 200% this quarter')).toBe('policy');
  });
});
