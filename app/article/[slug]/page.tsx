import { notFound } from 'next/navigation';
import { getAllArticles, getArticleBySlug, getRelatedArticles } from '@/lib/articles';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';
import { formatTimeAgo } from '@/lib/formatTimeAgo';

export function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }));
}

// ISR — also lets brand-new slugs render on demand between rebuilds
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  const related = getRelatedArticles(article, 3);
  return (
    <>
      <Header activeCategory={article.category} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {article.imageUrl && (
          <div className="mb-6 w-full aspect-[16/8] rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            {/* eslint-disable-next-line @next/next-eslint/no-img-element */}
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <p className="mb-2 text-xs uppercase tracking-widest text-neutral-500">
          {article.category} · {article.source} · {formatTimeAgo(article.publishedAt)}
        </p>
        <h1 className="mb-4 text-2xl font-bold leading-tight text-neutral-900 dark:text-neutral-100">
          {article.title}
        </h1>
        <p className="mb-6 leading-relaxed text-neutral-700 dark:text-neutral-300">{article.summary}</p>
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          Read full article →
        </a>
        {related.length > 0 && (
          <section className="mt-12">
            <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">Related Stories</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map(a => <ArticleCard key={a.slug} article={a} />)}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
