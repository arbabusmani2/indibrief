import Link from 'next/link';
import { getArchiveArticles } from '@/lib/articles';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';

export const revalidate = 3600;

function dayLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

export default function ArchivePage() {
  const articles = getArchiveArticles();

  // Group by ingested day (IST)
  const groups: { label: string; articles: typeof articles }[] = [];
  const seen: Record<string, number> = {};

  for (const article of articles) {
    const label = dayLabel(article.ingestedAt);
    if (seen[label] === undefined) {
      seen[label] = groups.length;
      groups.push({ label, articles: [] });
    }
    groups[seen[label]].articles.push(article);
  }

  return (
    <>
      <Header activeCategory="all" />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Archive</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {articles.length} stories older than 24 hours
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-orange-500 hover:text-orange-400 transition-colors font-medium"
          >
            ← Today&apos;s Feed
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-neutral-500">No archived stories yet.</p>
            <p className="mt-1 text-neutral-600 text-sm">Stories move here after 24 hours.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map(group => (
              <section key={group.label}>
                {/* Day heading */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                    {group.label}
                  </h2>
                  <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
                  <span className="text-xs text-neutral-400 whitespace-nowrap">
                    {group.articles.length} stories
                  </span>
                </div>
                {/* 2-col card grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.articles.map(article => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
