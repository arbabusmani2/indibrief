import Link from 'next/link';
import { getHomepageArticles, getTodayArticles } from '@/lib/articles';
import { Header } from '@/components/Header';
import { ArticleList } from '@/components/ArticleList';
import { AutoRefresh } from '@/components/AutoRefresh';

// ISR: regenerate this page in the background every hour on Vercel
export const revalidate = 3600;

export default function HomePage() {
  // At least 200 stories, capped at 300 to keep the page light
  const articles = getHomepageArticles(200).slice(0, 300);
  const todayCount = getTodayArticles().length;
  const latest = articles[0];

  return (
    <>
      <AutoRefresh />
      <Header activeCategory="all" />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-neutral-500">
            <span className="text-neutral-800 dark:text-neutral-300 font-semibold">{articles.length}</span> latest stories
            <span className="hidden sm:inline"> · {todayCount} in the last 24h</span>
          </p>
          <div className="flex items-center gap-4">
            {latest && (
              <p className="text-xs text-neutral-400 dark:text-neutral-600">
                Updated {new Date(latest.ingestedAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
                })} IST
              </p>
            )}
            <Link
              href="/archive"
              className="text-xs text-orange-500 hover:text-orange-400 transition-colors font-medium"
            >
              Browse Archive →
            </Link>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-neutral-500 text-lg">No stories yet.</p>
            <p className="mt-2 text-neutral-600 text-sm">
              Check the{' '}
              <Link href="/archive" className="text-orange-500 hover:underline">archive</Link>
              {' '}for older stories.
            </p>
          </div>
        ) : (
          <ArticleList articles={articles} />
        )}
      </main>
    </>
  );
}
