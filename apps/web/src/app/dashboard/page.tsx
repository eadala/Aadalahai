"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { UserAnalytics } from "@/lib/api";
import { AdalahApiError } from "@adalah/sdk";
import { isAuthenticated } from "@/lib/auth";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[var(--accent)]">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    api
      .getAnalytics()
      .then((res) => setAnalytics(res.analytics))
      .catch((err) => {
        if (err instanceof AdalahApiError) setError(err.message);
        else setError("تعذر تحميل الإحصائيات");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--text-secondary)]">جاري التحميل...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || "لا توجد بيانات"}</p>
        <Link href="/chat" className="text-[var(--accent)] hover:underline">
          العودة للمحادثة
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6" dir="rtl">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--accent)]">لوحة التحكم</h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              {analytics.isLawyer ? "حساب محامٍ" : "حساب مستخدم"} — عضو منذ{" "}
              {new Date(analytics.memberSince).toLocaleDateString("ar-SA")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/chat"
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg-secondary)]"
            >
              المحادثة
            </Link>
            <Link
              href="/documents"
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg-secondary)]"
            >
              الوثائق
            </Link>
            {!analytics.onboardingCompleted && (
              <Link
                href="/onboarding"
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm hover:bg-[var(--accent-hover)]"
              >
                إكمال التسجيل كمحامٍ
              </Link>
            )}
          </div>
        </div>

        {analytics.isLawyer && analytics.lawyerProfile && (
          <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <h2 className="mb-3 font-medium text-[var(--accent)]">الملف المهني</h2>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="text-[var(--text-secondary)]">رقم الترخيص: </span>
                {analytics.lawyerProfile.licenseNumber}
              </p>
              <p>
                <span className="text-[var(--text-secondary)]">التخصص: </span>
                {analytics.lawyerProfile.specialization}
              </p>
              <p>
                <span className="text-[var(--text-secondary)]">النقابة: </span>
                {analytics.lawyerProfile.barAssociation}
              </p>
              {analytics.lawyerProfile.phone && (
                <p dir="ltr">
                  <span className="text-[var(--text-secondary)]">الجوال: </span>
                  {analytics.lawyerProfile.phone}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="المحادثات" value={analytics.totalSessions} />
          <StatCard label="الرسائل" value={analytics.totalMessages} />
          <StatCard label="رسائل هذا الأسبوع" value={analytics.messagesThisWeek} />
          <StatCard label="الوثائق" value={analytics.totalDocuments} />
          <StatCard label="وثائق جاهزة" value={analytics.documentsReady} />
          <StatCard label="التحليلات" value={analytics.totalAnalyses} />
          <StatCard
            label="آخر نشاط"
            value={
              analytics.lastActivityAt
                ? new Date(analytics.lastActivityAt).toLocaleDateString("ar-SA")
                : "—"
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <h2 className="mb-4 font-medium">آخر المحادثات</h2>
            {analytics.recentSessions.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">لا توجد محادثات بعد</p>
            ) : (
              <ul className="space-y-2">
                {analytics.recentSessions.map((session) => (
                  <li key={session.id}>
                    <Link
                      href="/chat"
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
                    >
                      {session.title}
                      <span className="mr-2 text-xs text-[var(--text-secondary)]">
                        {new Date(session.updatedAt).toLocaleDateString("ar-SA")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <h2 className="mb-4 font-medium">آخر الوثائق</h2>
            {analytics.recentDocuments.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">لا توجد وثائق بعد</p>
            ) : (
              <ul className="space-y-2">
                {analytics.recentDocuments.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href="/documents"
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
                    >
                      <span>{doc.title}</span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        {doc.status === "ready" ? "جاهزة" : doc.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
