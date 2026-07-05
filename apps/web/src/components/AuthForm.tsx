"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import type { ApiError } from "@/lib/types";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result =
        mode === "login"
          ? await api.login(email, password)
          : await api.register(email, password, name);

      saveAuth(result.tokens.accessToken, result.tokens.refreshToken, result.user);
      router.push("/chat");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr?.error?.message ?? "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[var(--accent)]">عدالة</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              placeholder="محامي تجريبي"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            placeholder="lawyer@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-[var(--text-secondary)]">
            كلمة المرور
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            dir="ltr"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            placeholder="SecurePass1"
          />
          {mode === "register" && (
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              8 أحرف على الأقل، حرف كبير وصغير ورقم
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--accent)] py-3 font-medium transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {loading ? "جاري..." : mode === "login" ? "دخول" : "تسجيل"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        {mode === "login" ? (
          <>
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-[var(--accent)] hover:underline">
              سجّل الآن
            </Link>
          </>
        ) : (
          <>
            لديك حساب؟{" "}
            <Link href="/login" className="text-[var(--accent)] hover:underline">
              سجّل الدخول
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
