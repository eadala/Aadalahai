"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { AdalahApiError } from "@adalah/sdk";
import { isAuthenticated, saveAuth, getAccessToken, getRefreshToken } from "@/lib/auth";

export default function OnboardingPage() {
  const router = useRouter();
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [barAssociation, setBarAssociation] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    api
      .getOnboardingStatus()
      .then((status) => {
        if (status.onboardingCompleted) router.replace("/dashboard");
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.completeLawyerOnboarding({
        licenseNumber,
        specialization,
        barAssociation,
        phone: phone || undefined,
      });

      const access = getAccessToken();
      const refresh = getRefreshToken();
      if (access && refresh) {
        saveAuth(access, refresh, result.user);
      }

      router.push("/dashboard");
    } catch (err) {
      if (err instanceof AdalahApiError) setError(err.message);
      else setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--text-secondary)]">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-4" dir="rtl">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
        <h1 className="text-2xl font-bold text-[var(--accent)]">تسجيل المحامي</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          أكمل بياناتك المهنية للوصول إلى ميزات المحامين في عدالة
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">رقم الترخيص</label>
            <input
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
              dir="ltr"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              placeholder="LIC-12345"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">التخصص</label>
            <input
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              placeholder="قانون العمل"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">نقابة المحامين</label>
            <input
              value={barAssociation}
              onChange={(e) => setBarAssociation(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              placeholder="نقابة المحامين السعوديين"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[var(--text-secondary)]">الجوال (اختياري)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 outline-none focus:border-[var(--accent)]"
              placeholder="05xxxxxxxx"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent)] py-3 font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "إكمال التسجيل"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          <Link href="/chat" className="text-[var(--accent)] hover:underline">
            تخطي والذهاب للمحادثة
          </Link>
        </p>
      </div>
    </div>
  );
}
