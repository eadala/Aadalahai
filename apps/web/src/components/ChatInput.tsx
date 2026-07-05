"use client";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = "اكتب سؤالك القانوني...",
}: ChatInputProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLTextAreaElement;
    const content = input.value.trim();
    if (!content || disabled) return;
    onSend(content);
    input.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-[var(--border)] p-4">
      <div className="flex gap-3">
        <textarea
          name="message"
          rows={2}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          className="self-end rounded-xl bg-[var(--accent)] px-6 py-3 font-medium transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          إرسال
        </button>
      </div>
      <p className="mt-2 text-xs text-[var(--text-secondary)]">
        هذه المعلومات استشارية وليست استشارة قانونية رسمية.
      </p>
    </form>
  );
}
