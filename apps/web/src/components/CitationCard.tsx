import type { Citation } from "@/lib/types";

interface CitationCardProps {
  citations: Citation[];
}

export function CitationCard({ citations }: CitationCardProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-[var(--text-secondary)]">المصادر:</p>
      {citations.map((c, i) => (
        <div
          key={`${c.documentId}-${i}`}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-[var(--accent)]">{c.documentTitle}</span>
            <span className="text-xs text-[var(--text-secondary)]">
              {(c.similarity * 100).toFixed(0)}% تطابق
            </span>
          </div>
          <p className="mt-1 text-[var(--text-secondary)] line-clamp-2">{c.chunkContent}</p>
        </div>
      ))}
    </div>
  );
}
