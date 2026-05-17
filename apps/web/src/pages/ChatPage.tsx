import { FormEvent, useMemo, useState } from "react";
import { useTestData } from "../hooks";

const API_BASE = "http://localhost:4000";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChatPage({ open, onClose }: Props) {
  const { data } = useTestData();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Ask me about deposits, landlord behavior, agreements, or where to start with tenant rights."
    }
  ]);

  const quickPrompts = useMemo(
    () => [
      "How do I respond to a 6-month deposit demand?",
      "What should I check before signing a Bangalore rental agreement?",
      "How do I document surprise landlord visits?"
    ],
    []
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(-6)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Chat request failed");
      }

      setMessages((current) => [...current, { role: "assistant", text: data.reply }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "The assistant is unavailable right now. Check your Gemini configuration."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="chat-widget" aria-live="polite">
      {open ? (
        <>
          <button type="button" className="chat-backdrop" aria-label="Close AI assistant" onClick={onClose} />
          <section className="chat-panel card">
            <div className="chat-panel-header">
              <div>
                <span className="eyebrow">AI assistant</span>
                <h2>Tenant help, powered by Gemini</h2>
              </div>
              <button type="button" className="chat-close" onClick={onClose} aria-label="Close assistant">
                ×
              </button>
            </div>
            <p className="surface-note">
              Use this for quick guidance on deposits, agreements, landlord behavior, and next steps.
            </p>

            <div className="chat-layout">
              <div className="chat-messages">
                {messages.map((entry, index) => (
                  <div
                    key={index}
                    className={entry.role === "assistant" ? "chat-bubble assistant" : "chat-bubble user"}
                  >
                    {entry.text}
                  </div>
                ))}
                {isLoading ? <div className="chat-bubble assistant">Thinking...</div> : null}
              </div>

              <aside className="chat-sidebar">
                <div className="sidebar-panel">
                  <strong>Suggested prompts</strong>
                  <div className="list">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="quick-link"
                        onClick={() => setMessage(prompt)}
                      >
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {data ? (
                  <div className="sidebar-panel">
                    <strong>Live context</strong>
                    <small className="surface-note">{data.landlords.length} landlords loaded</small>
                    <small className="surface-note">{data.reviews.length} reviews loaded</small>
                  </div>
                ) : null}
              </aside>
            </div>

            <form onSubmit={handleSubmit} className="chat-form">
              <label className="sr-only" htmlFor="chat-message">
                Ask DoorSpeaks Assistant
              </label>
              <textarea
                id="chat-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about deposit limits, eviction clauses, review strategy, or what to ask before moving in..."
              />
              <button type="submit" disabled={isLoading || !message.trim()}>
                {isLoading ? "Sending..." : "Send to Gemini"}
              </button>
            </form>
          </section>
        </>
      ) : null}
    </div>
  );
}
