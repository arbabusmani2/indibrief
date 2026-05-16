'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatTimeAgo } from '@/lib/formatTimeAgo';
import type { Article } from '@/lib/types';

const CATEGORY_STYLES: Record<string, { pill: string; dot: string }> = {
  ecosystem: { pill: 'bg-green-950 text-green-400 border border-green-800',  dot: 'bg-green-400' },
  funding:   { pill: 'bg-yellow-950 text-yellow-400 border border-yellow-800', dot: 'bg-yellow-400' },
  growth:    { pill: 'bg-emerald-950 text-emerald-400 border border-emerald-800', dot: 'bg-emerald-400' },
  policy:    { pill: 'bg-pink-950 text-pink-400 border border-pink-800',     dot: 'bg-pink-400' },
};

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

function Thumbnail({ url, title }: { url: string; title: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next-eslint/no-img-element
    <img
      src={url}
      alt={title}
      onError={() => setFailed(true)}
      className="w-full h-full object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const cat = CATEGORY_STYLES[article.category] ?? CATEGORY_STYLES.ecosystem;

  if (featured) {
    return (
      <Link href={`/article/${article.slug}`} className="block group mb-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden hover:border-orange-500/50 transition-colors">
          {article.imageUrl && (
            <div className="w-full h-44 bg-neutral-800 overflow-hidden">
              <Thumbnail url={article.imageUrl} title={article.title} />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">
                Top Story
              </span>
            </div>
            <h2 className="text-lg font-bold leading-snug text-neutral-100 group-hover:text-orange-400 transition-colors">
              {article.title}
            </h2>
            {article.summary && (
              <p className="mt-2 text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                {article.summary}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.pill}`}>
                {article.category}
              </span>
              <span className="text-neutral-500 text-xs">{article.source}</span>
              <span className="text-neutral-700 text-xs">·</span>
              <span className="text-neutral-500 text-xs">{formatTimeAgo(article.publishedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`} className="block group">
      <div className="flex gap-3 py-3.5 border-b border-neutral-800/70 hover:bg-neutral-900/40 -mx-3 px-3 rounded-lg transition-colors">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold leading-snug text-neutral-200 group-hover:text-orange-400 transition-colors">
            {article.title}
          </h2>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${cat.pill}`}>
              {article.category}
            </span>
            <span className="text-neutral-500 text-xs">{article.source}</span>
            <span className="text-neutral-700 text-xs">·</span>
            <span className="text-neutral-600 text-xs">{formatTimeAgo(article.publishedAt)}</span>
          </div>
        </div>
        {article.imageUrl && (
          <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-neutral-800">
            <Thumbnail url={article.imageUrl} title={article.title} />
          </div>
        )}
      </div>
    </Link>
  );
}
