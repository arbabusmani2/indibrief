import { notFound } from 'next/navigation';
import { getArticlesByCategory } from '@/lib/articles';
import { Header } from '@/components/Header';
import { ArticleList } from '@/components/ArticleList';
import type { Category } from '@/lib/types';

const VALID: Category[] = ['ecosystem', 'funding', 'growth', 'policy'];

export function generateStaticParams() {
  return VALID.map(category => ({ category }));
}

export const dynamic = 'force-static';

interface Props {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!VALID.includes(category as Category)) notFound();
  const articles = getArticlesByCategory(category as Category);
  return (
    <>
      <Header activeCategory={category as Category} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
          {articles.length} {category} stories
        </p>
        <ArticleList articles={articles} />
      </main>
    </>
  );
}
