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
