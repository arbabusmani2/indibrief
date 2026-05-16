import { notFound } from 'next/navigation';
import { getAllArticles, getArticleBySlug, getRelatedArticles } from '@/lib/articles';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';
import { formatTimeAgo } from '@/lib/formatTimeAgo';

export function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }));
}

export const dynamic = 'force-static';

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
        <p className="mb-2 text-xs uppercase tracking-widest text-neutral-500">
          {article.category} · {article.source} · {formatTimeAgo(article.publishedAt)}
        </p>
        <h1 className="mb-4 text-2xl font-bold leading-tight text-neutral-100">
          {article.title}
        </h1>
        <p className="mb-6 leading-relaxed text-neutral-300">{article.summary}</p>
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
            {related.map(a => <ArticleCard key={a.slug} article={a} />)}
          </section>
        )}
      </main>
    </>
  );
}
