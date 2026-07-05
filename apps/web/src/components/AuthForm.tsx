"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AdalahApiError } from "@adalah/sdk";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<"user" | "lawyer">("user");
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

      if (mode === "register" && accountType === "lawyer") {
        router.push("/onboarding");
      } else if (mode === "login" && result.user.role === "lawyer") {
        router.push("/dashboard");
      } else {
        router.push("/chat");
      }
    } catch (err) {
      if (err instanceof AdalahApiError) {
        setError(err.message);
      } else {
        setError("حدث خطأ، حاول مرة أخرى");
      }
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
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">نوع الحساب</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAccountType("user")}
                className={`flex-1 rounded-lg border py-2 text-sm ${
                  accountType === "user"
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)]"
                }`}
              >
                مستخدم
              </button>
              <button
                type="button"
                onClick={() => setAccountType("lawyer")}
                className={`flex-1 rounded-lg border py-2 text-sm ${
                  accountType === "lawyer"
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)]"
                }`}
              >
                محامٍ
              </button>
            </div>
          </div>
        )}

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
