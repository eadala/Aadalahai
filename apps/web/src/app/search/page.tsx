"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { SearchResult, SearchScope } from "@/lib/types";
import { AdalahApiError } from "@adalah/sdk";

const SCOPES: { value: SearchScope; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "legislation", label: "التشريعات" },
  { value: "user", label: "وثائقي" },
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) {
      setError("أدخل كلمتين على الأقل للبحث");
      return;
    }

    setError("");
    setLoading(true);
    setSearched(true);

    try {
      const res = await api.search(query.trim(), { scope });
      setResults(res.results);
    } catch (err) {
      if (err instanceof AdalahApiError) setError(err.message);
      else setError("تعذر إجراء البحث");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" dir="rtl">
      <header className="border-b border-[var(--border)] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--accent)]">البحث القانوني</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              ابحث في التشريعات المدمجة ووثائقك (بحث هجين)
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/documents" className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg-secondary)]">
              الوثائق
            </Link>
            <Link href="/chat" className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg-secondary)]">
              المحادثة
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <div className="mb-4 flex gap-2">
          {SCOPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setScope(s.value)}
              className={`rounded-lg border px-4 py-2 text-sm ${
                scope === s.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثال: إجازة سنوية، محامٍ، المادة 77"
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--accent)] px-6 py-3 font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {loading ? "جاري البحث..." : "بحث"}
          </button>
        </form>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
        )}

        {searched && !loading && results.length === 0 && !error && (
          <p className="text-center text-[var(--text-secondary)]">لا توجد نتائج</p>
        )}

        <div className="space-y-4">
          {results.map((result) => (
            <article
              key={`${result.source}-${result.chunkId}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-medium">{result.documentTitle}</h2>
                  {result.articleRef && (
                    <p className="text-xs text-[var(--text-secondary)]">{result.articleRef}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <span className="rounded-full bg-[var(--bg-tertiary)] px-3 py-1 text-xs">
                    {result.source === "legislation" ? "تشريع" : "وثيقة"}
                  </span>
                  <span className="rounded-full bg-[var(--bg-tertiary)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                    {result.matchType === "hybrid"
                      ? "هجين"
                      : result.matchType === "vector"
                        ? "دلالي"
                        : "نصي"}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{result.excerpt}</p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                درجة التطابق: {(result.score * 100).toFixed(0)}%
                {result.category ? ` — ${result.category}` : ""}
              </p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
