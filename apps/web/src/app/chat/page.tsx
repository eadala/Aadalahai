"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getStoredUser, isAuthenticated } from "@/lib/auth";
import type { ChatSession, Message, User } from "@/lib/types";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ChatSkeleton } from "@/components/ChatSkeleton";
import { SourceWarning } from "@/components/SourceWarning";
import Link from "next/link";

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);

  const loadSessions = useCallback(async () => {
    const { sessions: list } = await api.listSessions();
    setSessions(list);
    return list;
  }, []);

  const loadSession = useCallback(async (id: string) => {
    const { session } = await api.getSession(id);
    setActiveSession(session);
    setMessages(session.messages ?? []);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const stored = getStoredUser<User>();
    setUser(stored);

    loadSessions()
      .then((list) => {
        if (list.length > 0) loadSession(list[0].id);
      })
      .finally(() => setLoading(false));

    api.listDocuments().then((res) => setHasDocuments(res.documents.length > 0));
  }, [router, loadSessions, loadSession]);

  async function handleNewSession() {
    const { session } = await api.createSession();
    setSessions((prev) => [session, ...prev]);
    setActiveSession(session);
    setMessages([]);
  }

  async function handleSelectSession(id: string) {
    setLoadingSession(true);
    await loadSession(id);
    setLoadingSession(false);
  }

  async function handleDeleteSession(id: string) {
    await api.deleteSession(id);
    const list = await loadSessions();
    if (activeSession?.id === id) {
      if (list.length > 0) {
        await loadSession(list[0].id);
      } else {
        setActiveSession(null);
        setMessages([]);
      }
    }
  }

  async function handleSend(content: string) {
    if (!activeSession) {
      const { session } = await api.createSession(content.slice(0, 50));
      setSessions((prev) => [session, ...prev]);
      setActiveSession(session);
      setMessages([]);
      await sendToSession(session.id, content);
      return;
    }
    await sendToSession(activeSession.id, content);
  }

  async function sendToSession(sessionId: string, content: string) {
    setSending(true);

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      citations: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    const tempAssistant: Message = {
      id: `streaming-${Date.now()}`,
      role: "assistant",
      content: "",
      citations: [],
      createdAt: new Date().toISOString(),
    };
    setStreamingMessage(tempAssistant);

    try {
      for await (const event of api.streamMessage(sessionId, content)) {
        if (event.type === "user_message") {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempUserMsg.id ? event.data : m))
          );
        } else if (event.type === "chunk") {
          setStreamingMessage((prev) =>
            prev ? { ...prev, content: prev.content + event.data.content } : prev
          );
        } else if (event.type === "done") {
          setStreamingMessage(null);
          setMessages((prev) => [...prev, event.data.message]);
          await loadSessions();
        } else if (event.type === "error") {
          throw new Error(event.message);
        }
      }
    } catch {
      setStreamingMessage(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "عذرًا، حدث خطأ أثناء معالجة طلبك. حاول مرة أخرى.",
          citations: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--text-secondary)]">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        sessions={sessions}
        activeId={activeSession?.id ?? null}
        onSelect={handleSelectSession}
        onNew={handleNewSession}
        onDelete={handleDeleteSession}
      />

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <h2 className="font-medium">{activeSession?.title ?? "محادثة جديدة"}</h2>
            {user && (
              <p className="text-sm text-[var(--text-secondary)]">{user.name}</p>
            )}
          </div>
          <Link
            href="/profile"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]"
          >
            حسابي
          </Link>
        </header>

        {!hasDocuments && <SourceWarning />}

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {loadingSession ? (
            <ChatSkeleton />
          ) : (
            <>
          {messages.length === 0 && !streamingMessage && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-bold">مرحبًا بك في عدالة</h3>
              <p className="mt-2 max-w-md text-[var(--text-secondary)]">
                اسأل أي سؤال قانوني. ارفع وثائقك القانونية أولاً للحصول على إجابات
                مدعومة بالمصادر.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {streamingMessage && (
            <ChatMessage message={streamingMessage} isStreaming />
          )}
            </>
          )}
        </div>

        <ChatInput onSend={handleSend} disabled={sending} />
      </main>
    </div>
  );
}
