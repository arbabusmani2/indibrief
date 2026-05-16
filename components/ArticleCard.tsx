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
      <div className={`py-4 border-b border-neutral-800 ${featured ? 'border-l-2 border-l-orange-500 pl-4 -ml-4' : ''}`}>
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
