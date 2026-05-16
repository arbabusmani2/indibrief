import { ArticleCard } from './ArticleCard';
import type { Article } from '@/lib/types';

interface ArticleListProps {
  articles: Article[];
}

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return <p className="py-12 text-center text-neutral-500">No stories yet. Check back soon.</p>;
  }
  return (
    <div>
      {articles.map((article, i) => (
        <ArticleCard key={article.slug} article={article} featured={i === 0} />
      ))}
    </div>
  );
}
