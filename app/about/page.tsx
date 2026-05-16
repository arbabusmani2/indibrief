import { Header } from '@/components/Header';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-bold text-neutral-100">About IndiBrief</h1>
        <div className="space-y-4 leading-relaxed text-neutral-300">
          <p>
            IndiBrief is an automated news aggregator for the Indian startup ecosystem. We
            pull articles from leading Indian startup publications every hour and surface
            the most relevant stories for founders, operators, and investors.
          </p>
          <p>
            Every story links back to its original source. We do not produce original
            reporting — we make it easier to stay informed without spending hours reading.
          </p>
          <p>Built with Next.js and GitHub Actions.</p>
        </div>
      </main>
    </>
  );
}
