# Indian Startup Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js static site that ingests Indian startup news from RSS feeds hourly via GitHub Actions, and serves it as a live feed.

**Architecture:** GitHub Actions cron fires every hour, runs `scripts/ingest.ts` which fetches RSS feeds, deduplicates, keyword-categorizes, and commits updated JSON data files. Vercel detects the push and rebuilds the static Next.js site. No AI/LLM involved — zero API cost.

**Tech Stack:** Next.js 16 (App Router, static generation), TypeScript, Tailwind CSS, `rss-parser`, Jest + ts-jest, GitHub Actions, Vercel

---

## File Map

```
/
├── config/
│   └── sources.json              # RSS feed list (editable to add sources)
├── data/
│   ├── articles.json             # Article store — committed to repo
│   └── seen.json                 # Dedup set — committed to repo
├── lib/
│   ├── types.ts                  # Article, Source, Category types
│   ├── articles.ts               # Data access: getAllArticles, getBySlug, etc.
│   ├── formatTimeAgo.ts          # "2h ago" formatting
│   └── __tests__/
│       ├── articles.test.ts
│       └── formatTimeAgo.test.ts
├── scripts/
│   ├── ingest.ts                 # Main pipeline script (no git ops — workflow handles that)
│   └── lib/
│       ├── slugify.ts            # Slug generation from title + URL hash
│       ├── dedup.ts              # URL hashing and seen-set logic
│       ├── fetchFeeds.ts         # RSS fetching via rss-parser
│       ├── summarize.ts          # Claude Haiku integration
│       └── __tests__/
│           ├── slugify.test.ts
│           ├── dedup.test.ts
│           ├── fetchFeeds.test.ts
│           └── summarize.test.ts
├── components/
│   ├── Header.tsx                # Nav with category tabs (links, not state)
│   ├── ArticleCard.tsx           # Single article row (title, meta, link)
│   └── ArticleList.tsx           # List of ArticleCards, first one featured
├── app/
│   ├── layout.tsx                # Root layout: dark theme, Inter font, metadata
│   ├── globals.css               # Tailwind directives only
│   ├── page.tsx                  # Homepage — all articles, newest first
│   ├── [category]/
│   │   └── page.tsx              # Category feed (ecosystem/funding/growth/policy)
│   ├── article/
│   │   └── [slug]/
│   │       └── page.tsx          # Article detail + related stories
│   ├── about/
│   │   └── page.tsx              # What this site is
│   ├── sources/
│   │   └── page.tsx              # List of RSS sources
│   └── sitemap.ts                # Auto-generated sitemap
├── .github/
│   └── workflows/
│       └── ingest.yml            # Hourly cron workflow
├── jest.config.ts
├── tsconfig.json                 # (created by Next.js scaffold)
├── next.config.ts
└── tailwind.config.ts            # (created by Next.js scaffold)
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `jest.config.ts`, `.gitignore`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/arbuter/Documents/Claude\ code
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

Expected: Next.js project files created in current directory.

- [ ] **Step 2: Install pipeline and test dependencies**

```bash
npm install rss-parser @anthropic-ai/sdk
npm install -D jest ts-jest @types/jest
```

- [ ] **Step 3: Create jest.config.ts**

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathPattern: '.*\\.test\\.ts$',
};
```

- [ ] **Step 4: Add test script to package.json**

Open `package.json` and add to the `"scripts"` section:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: Update .gitignore**

Append to `.gitignore`:

```
.superpowers/
.env.local
```

- [ ] **Step 6: Verify the scaffold builds**

```bash
npm run build
```

Expected: Build succeeds (exit 0). The default Next.js page compiles.

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind and ts-jest"
```

---

## Task 2: Data Files, Config, and Types

**Files:**
- Create: `data/articles.json`, `data/seen.json`, `config/sources.json`, `lib/types.ts`

- [ ] **Step 1: Create data directory with empty stores**

```bash
mkdir -p data config
echo '[]' > data/articles.json
echo '{}' > data/seen.json
```

- [ ] **Step 2: Create config/sources.json**

```json
[
  { "name": "YourStory", "url": "https://yourstory.com/feed" },
  { "name": "Inc42", "url": "https://inc42.com/feed/" },
  { "name": "Economic Times Startups", "url": "https://economictimes.indiatimes.com/small-biz/startups/rssfeeds/77296800.cms" },
  { "name": "Entrackr", "url": "https://entrackr.com/feed/" },
  { "name": "VCCircle", "url": "https://www.vccircle.com/feed" },
  { "name": "Mint Startups", "url": "https://www.livemint.com/rss/startups" },
  { "name": "The Ken", "url": "https://the-ken.com/feed/" },
  { "name": "Moneycontrol Startups", "url": "https://www.moneycontrol.com/rss/startups.xml" }
]
```

> **Note on The Ken:** Most Ken stories are paywalled. Their RSS feed includes headlines and summaries which Claude can still categorize usefully. If the RSS feed stops working, remove it from `config/sources.json` — the ingest script will log a warning and continue with other sources.
```

- [ ] **Step 3: Create lib/types.ts**

```typescript
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
```

- [ ] **Step 4: Commit**

```bash
git add data/ config/ lib/types.ts
git commit -m "feat: add data files, RSS source config, and shared types"
```

---

## Task 3: formatTimeAgo Utility (TDD)

**Files:**
- Create: `lib/formatTimeAgo.ts`, `lib/__tests__/formatTimeAgo.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// lib/__tests__/formatTimeAgo.test.ts
import { formatTimeAgo } from '../formatTimeAgo';

describe('formatTimeAgo', () => {
  const now = new Date('2026-05-16T12:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterEach(() => jest.useRealTimers());

  it('returns "just now" for less than 1 minute', () => {
    const date = new Date('2026-05-16T11:59:30Z').toISOString();
    expect(formatTimeAgo(date)).toBe('just now');
  });

  it('returns minutes for less than 1 hour', () => {
    const date = new Date('2026-05-16T11:45:00Z').toISOString();
    expect(formatTimeAgo(date)).toBe('15m ago');
  });

  it('returns hours for less than 1 day', () => {
    const date = new Date('2026-05-16T09:00:00Z').toISOString();
    expect(formatTimeAgo(date)).toBe('3h ago');
  });

  it('returns days for 1 day or more', () => {
    const date = new Date('2026-05-14T12:00:00Z').toISOString();
    expect(formatTimeAgo(date)).toBe('2d ago');
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- lib/__tests__/formatTimeAgo.test.ts
```

Expected: FAIL — `Cannot find module '../formatTimeAgo'`

- [ ] **Step 3: Implement formatTimeAgo**

```typescript
// lib/formatTimeAgo.ts
export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
```

- [ ] **Step 4: Run to confirm pass**

```bash
npm test -- lib/__tests__/formatTimeAgo.test.ts
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/formatTimeAgo.ts lib/__tests__/formatTimeAgo.test.ts
git commit -m "feat: add formatTimeAgo utility"
```

---

## Task 4: Slugify Utility (TDD)

**Files:**
- Create: `scripts/lib/slugify.ts`, `scripts/lib/__tests__/slugify.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// scripts/lib/__tests__/slugify.test.ts
import { generateSlug } from '../slugify';

describe('generateSlug', () => {
  it('kebab-cases the title', () => {
    const slug = generateSlug('Zepto Raises $350M Series F', 'https://yourstory.com/zepto');
    expect(slug).toMatch(/^zepto-raises-350m-series-f-[a-f0-9]{6}$/);
  });

  it('strips special characters except hyphens', () => {
    const slug = generateSlug('SEBI's new rules: what it means!', 'https://example.com/1');
    expect(slug).toMatch(/^sebis-new-rules-what-it-means-[a-f0-9]{6}$/);
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
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- scripts/lib/__tests__/slugify.test.ts
```

Expected: FAIL — `Cannot find module '../slugify'`

- [ ] **Step 3: Implement generateSlug**

```typescript
// scripts/lib/slugify.ts
import crypto from 'crypto';

export function generateSlug(title: string, url: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
    .replace(/-+$/, '');

  const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 6);
  return `${base}-${hash}`;
}
```

- [ ] **Step 4: Run to confirm pass**

```bash
npm test -- scripts/lib/__tests__/slugify.test.ts
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/slugify.ts scripts/lib/__tests__/slugify.test.ts
git commit -m "feat: add slug generation utility"
```

---

## Task 5: Dedup Utility (TDD)

**Files:**
- Create: `scripts/lib/dedup.ts`, `scripts/lib/__tests__/dedup.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// scripts/lib/__tests__/dedup.test.ts
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
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- scripts/lib/__tests__/dedup.test.ts
```

Expected: FAIL — `Cannot find module '../dedup'`

- [ ] **Step 3: Implement dedup**

```typescript
// scripts/lib/dedup.ts
import crypto from 'crypto';

export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}

export function isNewUrl(url: string, seen: Record<string, boolean>): boolean {
  return !seen[hashUrl(url)];
}

export function addToSeen(
  urls: string[],
  seen: Record<string, boolean>
): Record<string, boolean> {
  const updated = { ...seen };
  for (const url of urls) {
    updated[hashUrl(url)] = true;
  }
  return updated;
}
```

- [ ] **Step 4: Run to confirm pass**

```bash
npm test -- scripts/lib/__tests__/dedup.test.ts
```

Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/dedup.ts scripts/lib/__tests__/dedup.test.ts
git commit -m "feat: add URL deduplication utility"
```

---

## Task 6: RSS Feed Fetcher (TDD)

**Files:**
- Create: `scripts/lib/fetchFeeds.ts`, `scripts/lib/__tests__/fetchFeeds.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// scripts/lib/__tests__/fetchFeeds.test.ts
import { fetchFeeds } from '../fetchFeeds';
import type { Source } from '../../../lib/types';

jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => ({
    parseURL: jest.fn().mockImplementation((url: string) => {
      if (url === 'https://fail.com/feed') throw new Error('Network error');
      return Promise.resolve({
        items: [
          {
            link: `${url}/article-1`,
            title: 'Test Article 1',
            contentSnippet: 'A description.',
            pubDate: 'Fri, 16 May 2026 08:00:00 GMT',
          },
          {
            link: `${url}/article-2`,
            title: 'Test Article 2',
            contentSnippet: 'Another description.',
            pubDate: 'Fri, 16 May 2026 07:00:00 GMT',
          },
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
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- scripts/lib/__tests__/fetchFeeds.test.ts
```

Expected: FAIL — `Cannot find module '../fetchFeeds'`

- [ ] **Step 3: Implement fetchFeeds**

```typescript
// scripts/lib/fetchFeeds.ts
import Parser from 'rss-parser';
import type { Source } from '../../lib/types';

export interface RawArticle {
  url: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
}

const parser = new Parser({ timeout: 10_000 });

export async function fetchFeeds(sources: Source[]): Promise<RawArticle[]> {
  const results = await Promise.allSettled(sources.map(s => fetchFeed(s)));
  const items: RawArticle[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      items.push(...r.value);
    } else {
      console.warn(`[fetchFeeds] Skipping ${sources[i].name}: ${r.reason}`);
    }
  }
  return items;
}

async function fetchFeed(source: Source): Promise<RawArticle[]> {
  const feed = await parser.parseURL(source.url);
  return (feed.items ?? [])
    .filter(item => item.link || item.guid)
    .map(item => ({
      url: (item.link ?? item.guid) as string,
      title: item.title ?? '',
      description: item.contentSnippet ?? item.summary ?? item.content ?? '',
      source: source.name,
      publishedAt: item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString(),
    }));
}
```

- [ ] **Step 4: Run to confirm pass**

```bash
npm test -- scripts/lib/__tests__/fetchFeeds.test.ts
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/fetchFeeds.ts scripts/lib/__tests__/fetchFeeds.test.ts
git commit -m "feat: add RSS feed fetcher with error isolation"
```

---

## Task 7: Keyword Categorizer (TDD)

No AI — category derived from keyword matching on title + description. `ecosystem` is the fallback.

**Files:**
- Create: `scripts/lib/categorize.ts`, `scripts/lib/__tests__/categorize.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// scripts/lib/__tests__/categorize.test.ts
import { categorize } from '../categorize';

describe('categorize', () => {
  it('detects funding from title keywords', () => {
    expect(categorize('Zepto raises $350M Series F', '')).toBe('funding');
    expect(categorize('Jar raises fresh round at $300M valuation', '')).toBe('funding');
    expect(categorize('CRED secures investment from Tiger Global', '')).toBe('funding');
  });

  it('detects policy from title keywords', () => {
    expect(categorize('SEBI tightens angel fund rules', '')).toBe('policy');
    expect(categorize('RBI issues new UPI regulation', '')).toBe('policy');
    expect(categorize('Government launches PLI scheme for startups', '')).toBe('policy');
  });

  it('detects growth from title keywords', () => {
    expect(categorize('Meesho hits 150M users, revenue up 40%', '')).toBe('growth');
    expect(categorize('Blinkit GMV crosses 10000 crore mark', '')).toBe('growth');
    expect(categorize('PhonePe reaches profitability milestone', '')).toBe('growth');
  });

  it('falls back to ecosystem for unmatched titles', () => {
    expect(categorize('Ola acquires drone startup TechBird', '')).toBe('ecosystem');
  });

  it('checks description when title has no match', () => {
    expect(categorize('Startup news', 'Company announced a new funding round led by Sequoia')).toBe('funding');
  });

  it('title match takes priority over description', () => {
    expect(categorize('SEBI issues new rules', 'revenue grew 200% this quarter')).toBe('policy');
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- scripts/lib/__tests__/categorize.test.ts
```

Expected: FAIL — `Cannot find module '../categorize'`

- [ ] **Step 3: Implement categorize**

```typescript
// scripts/lib/categorize.ts
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
      'niti aayog', 'dpiit', 'fdi', 'gst'],
  },
  {
    category: 'growth',
    keywords: ['revenue', 'users', 'growth', 'gmv', 'arr', 'mrr', 'profitable',
      'profitability', 'scale', 'traction', 'metric', 'milestone', 'crore mark',
      'monthly active', 'dau', 'mau', 'retention', 'churn'],
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
```

- [ ] **Step 4: Run to confirm pass**

```bash
npm test -- scripts/lib/__tests__/categorize.test.ts
```

Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/categorize.ts scripts/lib/__tests__/categorize.test.ts
git commit -m "feat: add keyword-based article categorizer (no AI)"
```

---

## Task 8: Data Access Layer (TDD)

**Files:**
- Create: `lib/articles.ts`, `lib/__tests__/articles.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// lib/__tests__/articles.test.ts
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
    expect(getRelatedArticles(target, 1)).toHaveLength(0); // only 1 ecosystem article total
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- lib/__tests__/articles.test.ts
```

Expected: FAIL — `Cannot find module '../articles'`

- [ ] **Step 3: Implement lib/articles.ts**

```typescript
// lib/articles.ts
import { readFileSync } from 'fs';
import path from 'path';
import type { Article, Category } from './types';

function load(): Article[] {
  return JSON.parse(readFileSync(path.join(process.cwd(), 'data/articles.json'), 'utf-8'));
}

export function getAllArticles(): Article[] {
  return load();
}

export function getArticlesByCategory(category: Category): Article[] {
  return load().filter(a => a.category === category);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return load().find(a => a.slug === slug);
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return load()
    .filter(a => a.category === article.category && a.slug !== article.slug)
    .slice(0, limit);
}
```

- [ ] **Step 4: Run to confirm pass**

```bash
npm test -- lib/__tests__/articles.test.ts
```

Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/articles.ts lib/__tests__/articles.test.ts
git commit -m "feat: add article data access layer"
```

---

## Task 9: Ingest Script

No AI calls — pipeline is: fetch → deduplicate → keyword-categorize → save JSON.

**Files:**
- Create: `scripts/ingest.ts`

- [ ] **Step 1: Create scripts/ingest.ts**

```typescript
// scripts/ingest.ts
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fetchFeeds } from './lib/fetchFeeds';
import { isNewUrl, addToSeen } from './lib/dedup';
import { categorize } from './lib/categorize';
import { generateSlug } from './lib/slugify';
import type { Article, Source } from '../lib/types';

const ROOT = path.join(__dirname, '..');
const ARTICLES_PATH = path.join(ROOT, 'data/articles.json');
const SEEN_PATH = path.join(ROOT, 'data/seen.json');
const SOURCES_PATH = path.join(ROOT, 'config/sources.json');
const BATCH_CAP = 50;
const STORE_CAP = 500;

async function main() {
  const sources: Source[] = JSON.parse(readFileSync(SOURCES_PATH, 'utf-8'));
  const seen: Record<string, boolean> = JSON.parse(readFileSync(SEEN_PATH, 'utf-8'));
  const existing: Article[] = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'));

  const rawItems = await fetchFeeds(sources);
  const newItems = rawItems.filter(item => isNewUrl(item.url, seen)).slice(0, BATCH_CAP);

  if (newItems.length === 0) {
    console.log('[ingest] No new articles. Exiting without commit.');
    process.exit(0);
  }

  console.log(`[ingest] Processing ${newItems.length} new articles...`);
  const now = new Date().toISOString();

  const newArticles: Article[] = newItems.map(item => ({
    slug: generateSlug(item.title, item.url),
    title: item.title,
    summary: item.description,
    category: categorize(item.title, item.description),
    tags: [],
    source: item.source,
    sourceUrl: item.url,
    publishedAt: item.publishedAt,
    ingestedAt: now,
  }));

  const merged = [...newArticles, ...existing]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, STORE_CAP);

  writeFileSync(ARTICLES_PATH, JSON.stringify(merged, null, 2));
  writeFileSync(SEEN_PATH, JSON.stringify(addToSeen(newItems.map(i => i.url), seen), null, 2));

  console.log(`[ingest] Done. Wrote ${newArticles.length} articles (${merged.length} total).`);
  // Git commit/push is handled by the GitHub Actions workflow, not this script.
}

main().catch(err => {
  console.error('[ingest] Fatal error:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Add ts-node as dev dependency**

```bash
npm install -D ts-node
```

- [ ] **Step 3: Add ingest script to package.json**

Add to the `"scripts"` section in `package.json`:

```json
"ingest": "ts-node --project tsconfig.json scripts/ingest.ts"
```

- [ ] **Step 4: Run a dry test (no API key needed)**

```bash
npm run ingest 2>&1 | head -5
```

Expected: Script runs, logs fetch warnings per source (feeds timeout/error in local dev), exits with "No new articles". No crash.

- [ ] **Step 5: Commit**

```bash
git add scripts/ingest.ts package.json package-lock.json
git commit -m "feat: add hourly ingest script (keyword categorization, no AI)"
```

---

## Task 10: App Layout and Global Styles

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Replace app/globals.css with Tailwind directives only**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 2: Replace app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IndiBrief — Indian Startup News',
  description: 'Hourly-updated news for Indian startup founders and investors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-950 text-neutral-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Build to verify no errors**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: set up dark theme layout and global styles"
```

---

## Task 11: Header Component

**Files:**
- Create: `components/Header.tsx`

- [ ] **Step 1: Create components/Header.tsx**

```tsx
// components/Header.tsx
import Link from 'next/link';
import type { Category } from '@/lib/types';

const NAV = [
  { label: 'All', href: '/', key: 'all' },
  { label: 'Ecosystem', href: '/ecosystem', key: 'ecosystem' },
  { label: 'Funding', href: '/funding', key: 'funding' },
  { label: 'Growth', href: '/growth', key: 'growth' },
  { label: 'Policy', href: '/policy', key: 'policy' },
] as const;

interface HeaderProps {
  activeCategory?: Category | 'all';
}

export function Header({ activeCategory = 'all' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-orange-500">
          🇮🇳 IndiBrief
        </Link>
        <nav className="flex gap-5 text-sm">
          {NAV.map(({ label, href, key }) => (
            <Link
              key={href}
              href={href}
              className={
                activeCategory === key
                  ? 'border-b border-orange-500 text-orange-500 pb-0.5'
                  : 'text-neutral-400 hover:text-neutral-100 transition-colors'
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Build to verify no type errors**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: add Header component with category nav"
```

---

## Task 12: ArticleCard and ArticleList Components

**Files:**
- Create: `components/ArticleCard.tsx`, `components/ArticleList.tsx`

- [ ] **Step 1: Create components/ArticleCard.tsx**

```tsx
// components/ArticleCard.tsx
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/formatTimeAgo';
import type { Article } from '@/lib/types';

const CATEGORY_COLORS: Record<string, string> = {
  ecosystem: 'text-green-400',
  funding: 'text-yellow-400',
  growth: 'text-emerald-400',
  policy: 'text-pink-400',
};

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  return (
    <Link href={`/article/${article.slug}`} className="block group">
      <div
        className={`py-4 border-b border-neutral-800 ${
          featured ? 'border-l-2 border-l-orange-500 pl-4 -ml-4' : ''
        }`}
      >
        {featured && (
          <span className="mb-1 block text-xs uppercase tracking-widest text-orange-500">
            🔥 Top Story
          </span>
        )}
        <h2 className="font-semibold leading-snug text-neutral-100 group-hover:text-orange-400 transition-colors">
          {article.title}
        </h2>
        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
          <span className={CATEGORY_COLORS[article.category]}>{article.category}</span>
          <span>{article.source}</span>
          <span>{formatTimeAgo(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create components/ArticleList.tsx**

```tsx
// components/ArticleList.tsx
import { ArticleCard } from './ArticleCard';
import type { Article } from '@/lib/types';

interface ArticleListProps {
  articles: Article[];
}

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <p className="py-12 text-center text-neutral-500">No stories yet. Check back soon.</p>
    );
  }
  return (
    <div>
      {articles.map((article, i) => (
        <ArticleCard key={article.slug} article={article} featured={i === 0} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Build to verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/ArticleCard.tsx components/ArticleList.tsx
git commit -m "feat: add ArticleCard and ArticleList components"
```

---

## Task 13: Homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx**

```tsx
// app/page.tsx
import { getAllArticles } from '@/lib/articles';
import { Header } from '@/components/Header';
import { ArticleList } from '@/components/ArticleList';

export const dynamic = 'force-static';

export default function HomePage() {
  const articles = getAllArticles().slice(0, 100);
  return (
    <>
      <Header activeCategory="all" />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
          {articles.length} stories
        </p>
        <ArticleList articles={articles} />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Build and check**

```bash
npm run build
```

Expected: Build succeeds. The homepage route `/` is listed as a static page.

- [ ] **Step 3: Start dev server and visually verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Should show the header with nav tabs and "0 stories" (since `data/articles.json` is empty). No errors in terminal.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add homepage with live feed layout"
```

---

## Task 14: Category Pages

**Files:**
- Create: `app/[category]/page.tsx`

- [ ] **Step 1: Create app/[category]/page.tsx**

```tsx
// app/[category]/page.tsx
import { notFound } from 'next/navigation';
import { getArticlesByCategory } from '@/lib/articles';
import { Header } from '@/components/Header';
import { ArticleList } from '@/components/ArticleList';
import type { Category } from '@/lib/types';

const VALID: Category[] = ['ecosystem', 'funding', 'growth', 'policy'];

export function generateStaticParams() {
  return VALID.map(category => ({ category }));
}

export const dynamic = 'force-static';

interface Props {
  params: { category: string };
}

export default function CategoryPage({ params }: Props) {
  if (!VALID.includes(params.category as Category)) notFound();
  const category = params.category as Category;
  const articles = getArticlesByCategory(category);

  return (
    <>
      <Header activeCategory={category} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
          {articles.length} {category} stories
        </p>
        <ArticleList articles={articles} />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: 4 static category pages generated: `/ecosystem`, `/funding`, `/growth`, `/policy`.

- [ ] **Step 3: Verify in dev server**

```bash
npm run dev
```

Navigate to `http://localhost:3000/funding`. Header should highlight "Funding" tab. Empty state message shows.

- [ ] **Step 4: Commit**

```bash
git add app/[category]/page.tsx
git commit -m "feat: add static category pages"
```

---

## Task 15: Article Page

**Files:**
- Create: `app/article/[slug]/page.tsx`

- [ ] **Step 1: Create app/article/[slug]/page.tsx**

```tsx
// app/article/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getAllArticles, getArticleBySlug, getRelatedArticles } from '@/lib/articles';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';
import { formatTimeAgo } from '@/lib/formatTimeAgo';

export function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }));
}

export const dynamic = 'force-static';

interface Props {
  params: { slug: string };
}

export default function ArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const related = getRelatedArticles(article, 3);

  return (
    <>
      <Header activeCategory={article.category} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="mb-2 text-xs uppercase tracking-widest text-neutral-500">
          {article.category} · {article.source} · {formatTimeAgo(article.publishedAt)}
        </p>
        <h1 className="mb-4 text-2xl font-bold leading-tight text-neutral-100">
          {article.title}
        </h1>
        <p className="mb-6 leading-relaxed text-neutral-300">{article.summary}</p>
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          Read full article →
        </a>

        {related.length > 0 && (
          <section className="mt-12">
            <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
              Related Stories
            </p>
            {related.map(a => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: Build succeeds. With an empty `articles.json`, no article pages are generated (that's correct — they'll be generated once ingest runs).

- [ ] **Step 3: Commit**

```bash
git add app/article/
git commit -m "feat: add article detail page with related stories"
```

---

## Task 16: About and Sources Pages

**Files:**
- Create: `app/about/page.tsx`, `app/sources/page.tsx`

- [ ] **Step 1: Create app/about/page.tsx**

```tsx
// app/about/page.tsx
import { Header } from '@/components/Header';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-bold text-neutral-100">About IndiBrief</h1>
        <div className="space-y-4 leading-relaxed text-neutral-300">
          <p>
            IndiBrief is an automated news aggregator for the Indian startup ecosystem. We
            pull articles from leading Indian startup publications every hour, summarize them
            using AI, and surface the most relevant stories for founders, operators, and
            investors.
          </p>
          <p>
            Every story links back to its original source. We do not produce original
            reporting — we make it easier to stay informed without spending hours reading.
          </p>
          <p>
            Built with Next.js, GitHub Actions, and Claude AI.
          </p>
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Create app/sources/page.tsx**

```tsx
// app/sources/page.tsx
import { Header } from '@/components/Header';
import sources from '@/config/sources.json';

export default function SourcesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-neutral-100">Sources</h1>
        <p className="mb-8 text-neutral-400">
          We aggregate from these {sources.length} Indian startup publications:
        </p>
        <ul className="space-y-3">
          {sources.map(s => (
            <li key={s.name} className="flex items-center gap-3">
              <span className="font-medium text-neutral-100">{s.name}</span>
              <span className="text-xs text-neutral-600">{s.url}</span>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Add resolveJsonModule to tsconfig if not present**

Open `tsconfig.json` and confirm `"resolveJsonModule": true` is in `compilerOptions`. Add it if missing.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: Build succeeds with `/about` and `/sources` as static pages.

- [ ] **Step 5: Commit**

```bash
git add app/about/ app/sources/
git commit -m "feat: add About and Sources pages"
```

---

## Task 17: Sitemap

**Files:**
- Create: `app/sitemap.ts`

- [ ] **Step 1: Create app/sitemap.ts**

```typescript
// app/sitemap.ts
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
```

- [ ] **Step 2: Add NEXT_PUBLIC_SITE_URL to .env.local**

```bash
echo 'NEXT_PUBLIC_SITE_URL=https://indibrief.com' >> .env.local
```

(Replace with your actual domain when known.)

- [ ] **Step 3: Build and verify sitemap is generated**

```bash
npm run build && ls .next/server/app/sitemap.xml* 2>/dev/null || echo "Check: sitemap generated at /sitemap.xml"
```

Expected: Build succeeds. `/sitemap.xml` will be served at runtime by Next.js.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts .env.local
git commit -m "feat: add auto-generated sitemap"
```

---

## Task 18: GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/ingest.yml`

- [ ] **Step 1: Create .github/workflows/ingest.yml**

```yaml
# .github/workflows/ingest.yml
name: Hourly Article Ingest

on:
  schedule:
    - cron: '0 * * * *'   # every hour on the hour
  workflow_dispatch:        # allows manual trigger from GitHub UI

concurrency:
  group: ingest
  cancel-in-progress: false # never cancel a running ingest mid-way

jobs:
  ingest:
    runs-on: ubuntu-latest
    permissions:
      contents: write       # needed to push data files back to repo

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ingest script
        run: npx ts-node --project tsconfig.json scripts/ingest.ts

      - name: Commit and push updated data files
        run: |
          git config user.email "ingest-bot@users.noreply.github.com"
          git config user.name "IndiBrief Bot"
          git diff --quiet && echo "No changes to commit." || \
            (git add data/articles.json data/seen.json && \
             git commit -m "chore: hourly ingest $(date -u +%Y-%m-%dT%H:%M:%SZ)" && \
             git push)
```

- [ ] **Step 2: Add ANTHROPIC_API_KEY to GitHub repo secrets**

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret.

Name: `ANTHROPIC_API_KEY`
Value: your Anthropic API key from console.anthropic.com

- [ ] **Step 3: Commit the workflow file**

```bash
git add .github/
git commit -m "feat: add hourly GitHub Actions ingest workflow"
```

---

## Task 19: Vercel Deployment

- [ ] **Step 1: Push repo to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/indibrief.git
git push -u origin main
```

- [ ] **Step 2: Import project on Vercel**

Go to vercel.com → Add New → Project → Import the GitHub repo. Use all defaults (Vercel auto-detects Next.js).

- [ ] **Step 3: Add environment variable on Vercel**

In Vercel project → Settings → Environment Variables:

```
NEXT_PUBLIC_SITE_URL = https://your-vercel-url.vercel.app
```

(Update once you have a custom domain.)

- [ ] **Step 4: Trigger a manual ingest to populate articles.json**

On GitHub, go to Actions → Hourly Article Ingest → Run workflow. Wait ~2 minutes.

Expected: The workflow completes, commits new articles to `data/articles.json`, Vercel picks up the push and rebuilds. Visit your Vercel URL — articles should appear.

- [ ] **Step 5: Verify the live site**

- Homepage shows articles sorted newest first
- Clicking a category tab navigates to the filtered page
- Clicking an article shows the detail page with summary and source link
- `/sources` lists all 7 RSS sources
- `/sitemap.xml` returns XML with all routes

---

## Task 20: Full Test Suite Pass

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass (formatTimeAgo, slugify, dedup, fetchFeeds, summarize, articles — 6 test files).

- [ ] **Step 2: Run production build one final time**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors or warnings.

- [ ] **Step 3: Final commit**

```bash
git add -A
git status   # verify nothing unexpected is staged
git commit -m "chore: final cleanup and verified test suite"
```

---

## Environment Variables Reference

| Variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | GitHub Actions secret | Claude Haiku API access |
| `NEXT_PUBLIC_SITE_URL` | Vercel env var + `.env.local` | Sitemap base URL |
