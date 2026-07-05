export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`h-16 animate-pulse rounded-2xl bg-[var(--bg-tertiary)] ${
              i % 2 === 0 ? "w-2/3" : "w-1/2"
            }`}
          />
        </div>
      ))}
    </div>
  );
}
