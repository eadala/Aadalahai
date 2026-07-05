export function SourceWarning() {
  return (
    <div className="mx-6 mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
      <strong>تنبيه:</strong> لا توجد وثائق قانونية مرفوعة.{" "}
      <a href="/documents" className="underline hover:text-yellow-200">
        ارفع وثائقك
      </a>{" "}
      للحصول على إجابات مدعومة بمصادر قابلة للتحقق.
    </div>
  );
}
