import type { Category } from '../../lib/types';

/**
 * Publications whose beat is marketing / adtech. Stories from these default to
 * 'marketing' instead of 'ecosystem' when no stronger signal matches.
 * Names must match config/sources.json.
 */
const MARKETING_SOURCES = new Set([
  'Digiday',
  'Search Engine Land',
  'MarTech',
  'Social Media Today',
  'MarketingTech News',
  'afaqs',
]);

const RULES: { category: Category; keywords: string[] }[] = [
  {
    category: 'funding',
    keywords: ['raise', 'raised', 'raises', 'funding', 'series a', 'series b', 'series c',
      'series d', 'series e', 'series f', 'valuation', 'investment', 'investor',
      'venture', 'seed round', 'pre-seed', 'ipo', 'acqui', 'acquisition',
      'acquires', 'acquired', 'merger'],
  },
  {
    category: 'policy',
    keywords: ['sebi', 'rbi', 'government', 'regulation', 'regulator', 'policy', 'ministry',
      'compliance', 'court', 'lawsuit', 'parliament', 'niti aayog', 'dpiit', 'fdi', 'gst',
      // marketing / adtech regulation
      'privacy', 'gdpr', 'ccpa', 'antitrust', 'data protection', 'ftc'],
  },
  {
    category: 'marketing',
    keywords: ['marketing', 'marketer', 'advertis', 'ad spend', 'ad revenue', 'ad tech',
      'adtech', 'martech', 'programmatic', 'campaign', 'brand', 'agency', 'cmo',
      'seo', 'search ranking', 'serp', 'keyword', 'social media', 'influencer',
      'creative', 'media buying', 'retail media', 'publisher', 'attribution',
      'audience', 'targeting', 'ctv', 'ppc', 'copywriting'],
  },
  {
    category: 'growth',
    keywords: ['revenue', 'users', 'growth', 'gmv', 'arr', 'mrr', 'profitable',
      'profitability', 'traction', 'milestone', 'crore mark', 'monthly active',
      'dau', 'mau', 'retention', 'churn', 'conversion', 'roas'],
  },
];

/** Word-start match so 'roi' doesn't hit "android" and 'ad' doesn't hit "had". */
function buildMatcher(keywords: string[]): RegExp {
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(${escaped.join('|')})`, 'i');
}

const MATCHERS = RULES.map(r => ({ category: r.category, re: buildMatcher(r.keywords) }));

export function categorize(title: string, description: string, source?: string): Category {
  for (const { category, re } of MATCHERS) {
    if (re.test(title)) return category;
  }
  for (const { category, re } of MATCHERS) {
    if (re.test(description)) return category;
  }
  return source && MARKETING_SOURCES.has(source) ? 'marketing' : 'ecosystem';
}
