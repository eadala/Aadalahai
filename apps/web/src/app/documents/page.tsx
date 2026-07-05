"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { Document, DocumentAnalysis } from "@/lib/types";
import { AdalahApiError } from "@adalah/sdk";

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisByDoc, setAnalysisByDoc] = useState<Record<string, DocumentAnalysis | null>>({});

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    api
      .listDocuments()
      .then((res) => setDocuments(res.documents))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUploading(true);

    try {
      const { document } = await api.uploadDocument(title, content);
      setDocuments((prev) => [document, ...prev]);
      setTitle("");
      setContent("");
    } catch (err) {
      if (err instanceof AdalahApiError) {
        setError(err.message);
      } else {
        setError("فشل رفع الوثيقة");
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze(docId: string) {
    setAnalyzingId(docId);
    setError("");

    try {
      const { analysis } = await api.analyzeDocument(docId);
      setAnalysisByDoc((prev) => ({ ...prev, [docId]: analysis }));
    } catch (err) {
      if (err instanceof AdalahApiError) setError(err.message);
      else setError("فشل تحليل الوثيقة");
    } finally {
      setAnalyzingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--text-secondary)]">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="border-b border-[var(--border)] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--accent)]">الوثائق القانونية</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              ارفع وثائقك واستخدم التحليل الذكي أو المحادثة
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg-secondary)]"
            >
              لوحة التحكم
            </Link>
            <Link
              href="/chat"
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg-secondary)]"
            >
              العودة للمحادثة
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <form
          onSubmit={handleUpload}
          className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6"
        >
          <h2 className="mb-4 font-medium">رفع وثيقة جديدة</h2>

          <div className="mb-4">
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">العنوان</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              placeholder="نظام العمل السعودي"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">المحتوى</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              minLength={10}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              placeholder="المادة 77: للعامل الحق في..."
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="rounded-lg bg-[var(--accent)] px-6 py-3 font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {uploading ? "جاري الفهرسة..." : "رفع وفهرسة"}
          </button>
        </form>

        <section>
          <h2 className="mb-4 font-medium">الوثائق المفهرسة ({documents.length})</h2>

          {documents.length === 0 ? (
            <p className="text-center text-[var(--text-secondary)]">لا توجد وثائق بعد</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium">{doc.title}</h3>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={doc.status} />
                      {doc.status === "ready" && (
                        <button
                          onClick={() => handleAnalyze(doc.id)}
                          disabled={analyzingId === doc.id}
                          className="rounded-lg bg-[var(--accent)] px-3 py-1 text-xs hover:bg-[var(--accent-hover)] disabled:opacity-50"
                        >
                          {analyzingId === doc.id ? "جاري التحليل..." : "تحليل"}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
                    {doc.contentPreview}
                  </p>
                  {doc.chunkCount !== undefined && (
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {doc.chunkCount} مقطع مفهرس
                    </p>
                  )}

                  {analysisByDoc[doc.id] && (
                    <AnalysisPanel analysis={analysisByDoc[doc.id]!} />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function AnalysisPanel({ analysis }: { analysis: DocumentAnalysis }) {
  return (
    <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
      <h4 className="mb-2 font-medium text-[var(--accent)]">نتيجة التحليل</h4>
      <p className="text-sm">{analysis.summary}</p>

      {analysis.keyClauses.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-[var(--text-secondary)]">البنود الرئيسية</p>
          <ul className="mt-1 space-y-1 text-sm">
            {analysis.keyClauses.map((clause, i) => (
              <li key={i}>
                <strong>{clause.title}:</strong> {clause.content}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.risks.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-[var(--text-secondary)]">المخاطر</p>
          <ul className="mt-1 space-y-1 text-sm">
            {analysis.risks.map((risk, i) => (
              <li key={i}>
                [{risk.level}] {risk.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.recommendations.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-[var(--text-secondary)]">التوصيات</p>
          <ul className="mt-1 list-disc pr-5 text-sm">
            {analysis.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ready: "bg-green-500/20 text-green-400",
    processing: "bg-yellow-500/20 text-yellow-400",
    failed: "bg-red-500/20 text-red-400",
  };
  const labels: Record<string, string> = {
    ready: "جاهزة",
    processing: "جاري الفهرسة",
    failed: "فشلت",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs ${colors[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}
