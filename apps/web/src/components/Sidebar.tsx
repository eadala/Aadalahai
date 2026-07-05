"use client";

import Link from "next/link";
import type { ChatSession } from "@/lib/types";

interface SidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ sessions, activeId, onSelect, onNew, onDelete }: SidebarProps) {
  return (
    <aside className="flex w-72 flex-col border-l border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="border-b border-[var(--border)] p-4">
        <h1 className="text-xl font-bold text-[var(--accent)]">عدالة</h1>
        <p className="text-xs text-[var(--text-secondary)]">مساعد قانوني ذكي</p>
      </div>

      <div className="flex gap-2 p-3">
        <button
          onClick={onNew}
          className="flex-1 rounded-lg bg-[var(--accent)] py-2 text-sm font-medium hover:bg-[var(--accent-hover)]"
        >
          + محادثة جديدة
        </button>
        <Link
          href="/documents"
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
        >
          وثائق
        </Link>
        <Link
          href="/search"
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
        >
          بحث
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
        >
          لوحة
        </Link>
        <Link
          href="/profile"
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
        >
          حسابي
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 && (
          <p className="p-4 text-center text-sm text-[var(--text-secondary)]">
            لا توجد محادثات
          </p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`group mb-1 flex items-center rounded-lg ${
              activeId === s.id ? "bg-[var(--bg-tertiary)]" : "hover:bg-[var(--bg-tertiary)]/50"
            }`}
          >
            <button
              onClick={() => onSelect(s.id)}
              className="flex-1 truncate px-3 py-2 text-right text-sm"
            >
              {s.title}
            </button>
            <button
              onClick={() => onDelete(s.id)}
              className="px-2 py-2 text-[var(--text-secondary)] opacity-0 hover:text-red-400 group-hover:opacity-100"
              title="حذف"
            >
              ×
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}
