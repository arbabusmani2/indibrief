import Anthropic from '@anthropic-ai/sdk';
import type { RawArticle } from './fetchFeeds';
import type { Category } from '../../lib/types';

export interface SummarizedArticle {
  title: string;
  summary: string;
  category: Category;
  tags: string[];
  source: string;
  sourceUrl: string;
  publishedAt: string;
}

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

const PROMPT = (title: string, description: string, source: string) => `\
You are a news analyst for the Indian startup ecosystem.

Given the article below, return a JSON object with these exact fields:
- title: Clean headline, max 15 words
- summary: 2-3 sentences for a founder/investor audience
- category: One of "ecosystem", "funding", "growth", "policy". Use null if not relevant to Indian startups.
- tags: Array of 2-5 lowercase kebab-case tags

Article title: ${title}
Article description: ${description}
Source: ${source}

Return only valid JSON. No markdown, no extra text.`;

export async function summarizeArticles(items: RawArticle[]): Promise<(SummarizedArticle | null)[]> {
  return Promise.all(items.map(item => summarizeOne(item)));
}

async function summarizeOne(item: RawArticle): Promise<SummarizedArticle | null> {
  try {
    const message = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: PROMPT(item.title, item.description, item.source) }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(text);
    if (!parsed.category) return null;
    return {
      title: parsed.title,
      summary: parsed.summary,
      category: parsed.category as Category,
      tags: parsed.tags ?? [],
      source: item.source,
      sourceUrl: item.url,
      publishedAt: item.publishedAt,
    };
  } catch {
    console.warn(`[summarize] Discarding "${item.title}"`);
    return null;
  }
}
