import { FeaturedCard, ArticleCard } from './ArticleCard';
import type { Article } from '@/lib/types';

interface ArticleListProps {
  articles: Article[];
}

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-neutral-500 text-lg">No stories yet.</p>
        <p className="mt-1 text-neutral-600 text-sm">Check back soon — we update every hour.</p>
      </div>
    );
  }

  const [featured, ...rest] = articles;

  return (
    <div className="space-y-5">
      {/* Hero featured card */}
      <FeaturedCard article={featured} />

      {/* 2-column card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rest.map(article => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
