import type { Category } from '../../lib/types';

const RULES: { category: Category; keywords: string[] }[] = [
  {
    category: 'funding',
    keywords: ['raise', 'raised', 'raises', 'funding', 'series a', 'series b', 'series c',
      'series d', 'series e', 'series f', 'valuation', 'investment', 'investor',
      'venture', 'seed round', 'pre-seed', 'ipo', 'acqui', 'acquisition',
      'acquires', 'acquired', 'merge', 'merger'],
  },
  {
    category: 'policy',
    keywords: ['sebi', 'rbi', 'government', 'regulation', 'policy', 'rules', 'ministry',
      'compliance', 'tax', 'court', 'legal', 'law', 'act ', 'bill ', 'parliament',
      'niti aayog', 'dpiit', 'fdi', 'gst',
      // marketing / adtech regulation
      'privacy', 'gdpr', 'ccpa', 'antitrust', 'cookie', 'consent', 'data protection',
      'ftc', 'lawsuit'],
  },
  {
    category: 'growth',
    keywords: ['revenue', 'users', 'growth', 'gmv', 'arr', 'mrr', 'profitable',
      'profitability', 'scale', 'traction', 'metric', 'milestone', 'crore mark',
      'monthly active', 'dau', 'mau', 'retention', 'churn',
      // marketing performance topics
      'seo', 'search ranking', 'conversion', 'ctr', 'roi', 'roas', 'engagement',
      'campaign', 'ad spend', 'attribution', 'analytics', 'audience', 'targeting',
      'content marketing', 'email marketing', 'social media', 'influencer',
      'martech', 'adtech', 'programmatic'],
  },
];

export function categorize(title: string, description: string): Category {
  const titleLower = title.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some(k => titleLower.includes(k))) return rule.category;
  }
  const descLower = description.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some(k => descLower.includes(k))) return rule.category;
  }
  return 'ecosystem';
}
