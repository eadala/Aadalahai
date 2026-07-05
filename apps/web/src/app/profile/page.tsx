"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearAuth, getStoredUser, isAuthenticated, saveAuth } from "@/lib/auth";
import type { User } from "@adalah/sdk";
import { AdalahApiError } from "@adalah/sdk";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    api
      .getProfile()
      .then((res) => {
        setUser(res.user);
        setName(res.user.name);
      })
      .catch(() => setUser(getStoredUser<User>()))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await api.updateProfile(name);
      setUser(res.user);
      const token = localStorage.getItem("adalah_access_token");
      const refresh = localStorage.getItem("adalah_refresh_token");
      if (token && refresh) saveAuth(token, refresh, res.user);
      setMessage("تم تحديث الملف الشخصي");
    } catch (err) {
      if (err instanceof AdalahApiError) {
        setError(err.message);
      } else {
        setError("فشل التحديث");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearAuth();
    router.push("/login");
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
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--accent)]">الملف الشخصي</h1>
          <Link href="/chat" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
            العودة للمحادثة
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-6">
        <form onSubmit={handleSave} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <div className="mb-4">
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">البريد</label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              dir="ltr"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-secondary)] opacity-60"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">الدور</label>
            <input
              type="text"
              value={user?.role === "lawyer" ? "محامي" : user?.role === "admin" ? "مدير" : "مستخدم"}
              disabled
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-secondary)] opacity-60"
            />
          </div>

          {message && <p className="mb-4 text-sm text-green-400">{message}</p>}
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[var(--accent)] py-3 font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="mt-4 w-full rounded-lg border border-red-500/30 py-3 text-red-400 hover:bg-red-500/10"
        >
          تسجيل الخروج
        </button>
      </main>
    </div>
  );
}
