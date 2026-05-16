# Indian Startup Brief — Design Spec

**Date:** 2026-05-16
**Status:** Approved

## Overview

A website that aggregates and AI-summarizes news from the Indian startup ecosystem, updated hourly via an automated RSS pipeline. Targeted at founders, operators, and investors who want to stay informed without spending hours reading.

No monetization in scope for v1 — the goal is audience building.

---

## Architecture

**Approach: Static site + hourly rebuild**

A GitHub Actions cron job fires every hour, fetches new articles from RSS feeds, runs them through Claude Haiku for summarization and categorization, commits the updated data to the repo, and Vercel detects the push and rebuilds the static site.

```
RSS Feeds → GitHub Actions (cron, hourly) → Claude Haiku → data/articles.json → Next.js build → Vercel deploy
```

- **Hosting cost:** $0/month (Vercel free tier + GitHub Actions free tier)
- **AI cost:** ~$5–15/month depending on article volume
- **Content freshness:** ~60–65 min lag (cron jitter + ~2–5 min build time)
- **Deduplication:** URL hashed and checked against `data/seen.json` committed to the repo

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) with static generation (`generateStaticParams`) |
| Styling | Tailwind CSS |
| Hosting | Vercel (free tier) |
| Cron | GitHub Actions — `schedule: cron('0 * * * *')` |
| AI | Claude Haiku (`claude-haiku-4-5-20251001`) |
| Data store | JSON files committed to the repo (`data/articles.json`, `data/seen.json`) |

---

## Content

### Categories

| Category | Description |
|---|---|
| **Ecosystem** | Primary — founder stories, product launches, market moves, acquisitions |
| **Funding** | Round announcements, valuations, investor activity |
| **Growth** | Tactics, metrics, campaigns, what's working |
| **Policy** | Regulation, government schemes, SEBI/RBI actions affecting startups |

Each article is assigned exactly one category by the AI.

### RSS Sources (initial set)

- YourStory
- Inc42
- Economic Times Startups
- Entrackr
- VCCircle
- Mint Startups
- The Ken
- Moneycontrol Startups

New sources can be added by editing a `config/sources.json` file.

### AI Processing (per article)

Each new article is sent to Claude Haiku with a prompt that returns structured JSON:

```json
{
  "title": "Clean headline (max 15 words)",
  "summary": "2–3 sentence plain-English summary for a founder/investor audience",
  "category": "ecosystem | funding | growth | policy",
  "tags": ["quick-commerce", "series-f", "zepto"]
}
```

Articles where the AI cannot confidently categorize (e.g., generic tech news unrelated to Indian startups) are discarded.

---

## Site Structure

| Route | Description |
|---|---|
| `/` | Homepage — live feed of all stories, newest first, category filter tabs |
| `/ecosystem` | Filtered feed — ecosystem stories only |
| `/funding` | Filtered feed — funding stories only |
| `/growth` | Filtered feed — growth stories only |
| `/policy` | Filtered feed — policy stories only |
| `/article/[slug]` | Individual article — AI summary, category tag, source link, related stories (up to 3 from same category, sorted by recency) |
| `/about` | What this site is and how it works |
| `/sources` | List of RSS sources we aggregate from |
| `sitemap.xml` | Auto-generated at build time |

---

## Homepage Layout

**Live Feed style:** Stories in a scrollable list, newest first. Category filter tabs at the top. Top story highlighted with an accent border. Each list item shows: headline, category tag, source name, time ago.

No pagination in v1 — show the latest 100 articles on the homepage.

---

## Pipeline Design

### `scripts/ingest.ts`

Runs as a GitHub Actions step on hourly schedule.

1. Load `data/seen.json` (set of hashed article URLs already processed)
2. Fetch all RSS feeds in `config/sources.json` in parallel
3. For each article: hash the URL, skip if already in `seen.json`
4. Take the first 20 unseen articles (cap per run to control AI cost). Articles beyond 20 are not added to `seen.json` this run — they will be picked up in the next hourly run.
5. If zero new articles: exit early with no git commit (avoids triggering a pointless Vercel rebuild)
6. Send the batch to Claude Haiku and collect structured results
7. Append results to `data/articles.json`, sorted by `publishedAt` descending, capped at 500 total entries
8. Update `data/seen.json` with the URLs of the articles just processed
9. `git commit` and `git push` — Vercel picks up the change and rebuilds

### `data/articles.json` shape

Slugs are generated at ingest time: kebab-case the AI-cleaned title, truncate to 60 chars, append the first 6 chars of the URL hash to avoid collisions (e.g., `zepto-raises-350m-series-f-a3f9c1`).

```json
[
  {
    "slug": "zepto-raises-350m-series-f-a3f9c1",
    "title": "Zepto raises $350M Series F at $5B valuation",
    "summary": "Quick commerce startup Zepto has closed a $350M Series F round...",
    "category": "funding",
    "tags": ["quick-commerce", "series-f", "zepto"],
    "source": "YourStory",
    "sourceUrl": "https://yourstory.com/...",
    "publishedAt": "2026-05-16T07:30:00Z",
    "ingestedAt": "2026-05-16T08:02:00Z"
  }
]
```

### `config/sources.json` shape

```json
[
  { "name": "YourStory", "url": "https://yourstory.com/feed" },
  { "name": "Inc42", "url": "https://inc42.com/feed/" }
]
```

---

## Error Handling

- If an RSS feed times out or returns an error: skip it, log a warning, continue with remaining sources
- If Claude Haiku returns malformed JSON: discard the article and log
- If the git push fails (e.g., merge conflict from concurrent run): the GitHub Actions step exits non-zero, the run is marked failed, the next hourly run retries from scratch
- GitHub Actions concurrency lock (`concurrency: group: ingest`) prevents two pipeline runs from overlapping

---

## Out of Scope (v1)

- Email newsletter / subscriber list
- Search
- User accounts or authentication
- Comments or social features
- Monetization (ads, sponsored content)
- Manual editorial override UI
- Mobile app
