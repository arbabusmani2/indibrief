'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatTimeAgo } from '@/lib/formatTimeAgo';
import type { Article } from '@/lib/types';

const CATEGORY_STYLES: Record<string, { badge: string; gradient: string }> = {
  ecosystem: { badge: 'bg-green-500 text-white',   gradient: 'from-green-900/80 to-green-950' },
  funding:   { badge: 'bg-yellow-400 text-black',  gradient: 'from-yellow-900/80 to-yellow-950' },
  growth:    { badge: 'bg-emerald-500 text-white',  gradient: 'from-emerald-900/80 to-emerald-950' },
  policy:    { badge: 'bg-pink-500 text-white',     gradient: 'from-pink-900/80 to-pink-950' },
};

function Thumbnail({ url, title, failed, setFailed }: {
  url: string; title: string; failed: boolean; setFailed: (v: boolean) => void;
}) {
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next-eslint/no-img-element
    <img
      src={url}
      alt={title}
      className="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

/* ── Featured hero card (first article, full width) ── */
export function FeaturedCard({ article }: { article: Article }) {
  const [failed, setFailed] = useState(false);
  const cat = CATEGORY_STYLES[article.category] ?? CATEGORY_STYLES.ecosystem;
  const hasImage = !!article.imageUrl && !failed;

  return (
    <Link href={`/article/${article.slug}`} className="block group">
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-orange-500/60 transition-colors shadow-sm dark:shadow-none">
        {/* Image area */}
        <div className="relative w-full aspect-[16/7] bg-neutral-100 dark:bg-neutral-800">
          {article.imageUrl && (
            <Thumbnail url={article.imageUrl} title={article.title} failed={failed} setFailed={setFailed} />
          )}
          <div className={`absolute inset-0 ${hasImage
            ? 'bg-gradient-to-t from-black/80 via-black/10 to-transparent'
            : `bg-gradient-to-br ${cat.gradient}`
          }`} />
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${cat.badge}`}>
            {article.category}
          </span>
          <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-widest">
            Top Story
          </span>
        </div>
        {/* Content */}
        <div className="p-5">
          <h2 className="text-xl font-bold leading-snug text-neutral-900 dark:text-neutral-100 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
            {article.title}
          </h2>
          {article.summary && (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
              {article.summary}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-medium text-neutral-700 dark:text-neutral-400">{article.source}</span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Grid card (all other articles) ── */
export function ArticleCard({ article }: { article: Article }) {
  const [failed, setFailed] = useState(false);
  const cat = CATEGORY_STYLES[article.category] ?? CATEGORY_STYLES.ecosystem;
  const hasImage = !!article.imageUrl && !failed;

  return (
    <Link href={`/article/${article.slug}`} className="block group h-full">
      <div className="flex flex-col h-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-orange-500/50 transition-colors shadow-sm dark:shadow-none">
        {/* Image */}
        <div className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
          {article.imageUrl && (
            <Thumbnail url={article.imageUrl} title={article.title} failed={failed} setFailed={setFailed} />
          )}
          <div className={`absolute inset-0 ${hasImage
            ? 'bg-gradient-to-t from-black/50 to-transparent'
            : `bg-gradient-to-br ${cat.gradient}`
          }`} />
          <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cat.badge}`}>
            {article.category}
          </span>
        </div>
        {/* Content */}
        <div className="flex flex-col flex-1 p-3.5">
          <h2 className="flex-1 text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-200 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors line-clamp-3">
            {article.title}
          </h2>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="font-medium text-neutral-700 dark:text-neutral-400">{article.source}</span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span>{formatTimeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
