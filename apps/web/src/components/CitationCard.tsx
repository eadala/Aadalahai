"use client";

import { useState } from "react";
import type { Citation } from "@/lib/types";

interface CitationCardProps {
  citations: Citation[];
}

const confidenceLabels = {
  high: { text: "ثقة عالية", color: "bg-green-500/20 text-green-400" },
  medium: { text: "ثقة متوسطة", color: "bg-yellow-500/20 text-yellow-400" },
  low: { text: "ثقة منخفضة", color: "bg-red-500/20 text-red-400" },
};

export function CitationCard({ citations }: CitationCardProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-[var(--text-secondary)]">
        المصادر القانونية ({citations.length}):
      </p>
      {citations.map((c) => (
        <div
          key={`${c.documentId}-${c.index}`}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-sm"
        >
          <button
            type="button"
            onClick={() => setExpanded(expanded === c.index ? null : c.index)}
            className="flex w-full items-center justify-between p-3 text-right"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                {c.index}
              </span>
              <span className="font-medium text-[var(--accent)]">{c.documentTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${confidenceLabels[c.confidence].color}`}>
                {confidenceLabels[c.confidence].text}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {(c.similarity * 100).toFixed(0)}%
              </span>
            </div>
          </button>

          {expanded === c.index && (
            <div className="border-t border-[var(--border)] px-3 pb-3">
              {c.articles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {c.articles.map((article) => (
                    <div key={article.number} className="rounded bg-[var(--bg-tertiary)] p-2">
                      <span className="font-medium text-[var(--accent)]">{article.label}</span>
                      {article.text && (
                        <p className="mt-1 text-[var(--text-secondary)]">{article.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[var(--text-secondary)]">{c.excerpt || c.chunkContent}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
