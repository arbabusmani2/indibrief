import { getAllArticles } from '@/lib/articles';
import { Header } from '@/components/Header';
import { ArticleList } from '@/components/ArticleList';

export const dynamic = 'force-static';

export default function HomePage() {
  const articles = getAllArticles().slice(0, 100);
  const latest = articles[0];

  return (
    <>
      <Header activeCategory="all" />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-neutral-500">
            <span className="text-neutral-800 dark:text-neutral-300 font-semibold">{articles.length}</span> stories from Indian startup media
          </p>
          {latest && (
            <p className="text-xs text-neutral-400 dark:text-neutral-600">
              Updated {new Date(latest.ingestedAt).toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
              })} IST
            </p>
          )}
        </div>
        <ArticleList articles={articles} />
      </main>
    </>
  );
}
