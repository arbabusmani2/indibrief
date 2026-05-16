import { Header } from '@/components/Header';
import sources from '@/config/sources.json';

export default function SourcesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-neutral-100">Sources</h1>
        <p className="mb-8 text-neutral-400">
          We aggregate from these {sources.length} Indian startup publications:
        </p>
        <ul className="space-y-3">
          {sources.map((s: { name: string; url: string }) => (
            <li key={s.name} className="flex items-center gap-3">
              <span className="font-medium text-neutral-100">{s.name}</span>
              <span className="text-xs text-neutral-600">{s.url}</span>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
