import type { Message } from "@/lib/types";
import { CitationCard } from "./CitationCard";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[var(--accent)] text-white"
            : "border border-[var(--border)] bg-[var(--bg-secondary)]"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {isStreaming && (
          <span className="mt-1 inline-flex gap-1">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--text-secondary)]" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--text-secondary)]" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--text-secondary)]" />
          </span>
        )}
        {!isUser && <CitationCard citations={message.citations} />}
      </div>
    </div>
  );
}
