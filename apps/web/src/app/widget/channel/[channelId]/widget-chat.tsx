"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

function getApiOrigin() {
  if (typeof window === "undefined") return ""
  return window.location.origin
}

function sendCloseMessage() {
  if (typeof window !== "undefined" && window.parent !== window) {
    window.parent.postMessage({ type: "chasteai-close" }, "*")
  }
}

export function WidgetChat() {
  const params = useParams<{ channelId: string }>()
  const searchParams = useSearchParams()
  const channelId = params.channelId
  const apiOrigin = getApiOrigin()

  const color = searchParams.get("color") ?? "#6366f1"
  const title = searchParams.get("title") ?? "Chat"
  const greeting = searchParams.get("greeting") ?? ""
  const agentName = searchParams.get("agentName") ?? ""
  const isTest = searchParams.get("test") === "true"

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

  useEffect(() => {
    if (started) {
      inputRef.current?.focus()
    }
  }, [started])

  async function startConversation() {
    try {
      const res = await fetch(`${apiOrigin}/api/public/channels/${channelId}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isTest ? { test: true } : {}),
      })
      if (!res.ok) throw new Error("Failed to start conversation")
      const data = await res.json()
      setConversationId(data.conversation.id)
      setStarted(true)
    } catch {
      setError("Unable to connect. Please try again.")
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isStreaming || !conversationId) return

    const userContent = input.trim()
    setInput("")

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: userContent },
    ])

    setIsStreaming(true)
    setStreamingContent("")

    try {
      const res = await fetch(
        `${apiOrigin}/api/public/channels/${channelId}/chat/${conversationId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: userContent }),
        },
      )

      if (!res.ok) throw new Error("Failed")

      if (res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fullContent = ""
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = JSON.parse(line.slice(6))
            if (data.token) {
              fullContent += data.token
              setStreamingContent(fullContent)
            } else if (data.done) {
              setMessages((prev) => [
                ...prev,
                { id: data.messageId, role: "assistant", content: fullContent },
              ])
              setStreamingContent("")
            } else if (data.error) {
              throw new Error(data.error)
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "system",
          content: "Something went wrong. Try again?",
        },
      ])
    } finally {
      setIsStreaming(false)
      setStreamingContent("")
    }
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <p style={{ fontSize: 14, color: "#ef4444", textAlign: "center" }}>{error}</p>
      </div>
    )
  }

  if (!started) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <HeaderBar title={title} agentName={agentName} showClose isTest={isTest} color={color} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 14px ${color}33`,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 1.5 }}>
            {greeting || "Have a question? Start a conversation."}
          </p>
          <button
            onClick={startConversation}
            style={{
              padding: "10px 28px",
              borderRadius: 9999,
              border: "none",
              background: color,
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: `0 2px 8px ${color}33`,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.opacity = "0.9"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.opacity = "1"
            }}
          >
            Start chat
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <HeaderBar title={title} agentName={agentName} showClose isTest={isTest} color={color} />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  fontSize: 14,
                  lineHeight: 1.55,
                  ...(msg.role === "user"
                    ? {
                        background: color,
                        color: "#fff",
                        borderRadius: "16px 16px 4px 16px",
                      }
                    : msg.role === "system"
                      ? {
                          background: "#fef2f2",
                          color: "#dc2626",
                          borderRadius: "16px 16px 16px 4px",
                        }
                      : {
                          background: "#f1f5f9",
                          color: "#1e293b",
                          borderRadius: "16px 16px 16px 4px",
                        }),
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {streamingContent && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: "16px 16px 16px 4px",
                  fontSize: 14,
                  lineHeight: 1.55,
                  background: "#f1f5f9",
                  color: "#1e293b",
                }}
              >
                {streamingContent}
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: 14,
                    marginLeft: 2,
                    background: color,
                    borderRadius: 1,
                    verticalAlign: "text-bottom",
                    animation: "chasteai-pulse 1.2s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div style={{ padding: "12px 16px 16px", borderTop: "1px solid #f1f5f9" }}>
        <form onSubmit={sendMessage} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isStreaming}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              outline: "none",
              background: "#fff",
              color: "#1e293b",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            style={{
              width: 38,
              height: 38,
              borderRadius: 9999,
              border: "none",
              background: !input.trim() || isStreaming ? "#e2e8f0" : color,
              color: !input.trim() || isStreaming ? "#94a3b8" : "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: !input.trim() || isStreaming ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

function HeaderBar({
  title,
  agentName,
  showClose,
  isTest,
  color,
}: {
  title: string
  agentName: string
  showClose?: boolean
  isTest?: boolean
  color: string
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid #f1f5f9",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p
              style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" }}
            >
              {title}
            </p>
            {isTest && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#b45309",
                  background: "#fef3c7",
                  borderRadius: 9999,
                  padding: "2px 8px",
                  lineHeight: "16px",
                  letterSpacing: "0.03em",
                }}
              >
                TEST
              </span>
            )}
          </div>
          {agentName && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{agentName}</p>}
        </div>
      </div>
      {showClose && (
        <button
          onClick={sendCloseMessage}
          aria-label="Close chat"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            transition: "color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.color = "#64748b"
            btn.style.backgroundColor = "#f1f5f9"
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.color = "#94a3b8"
            btn.style.backgroundColor = "transparent"
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
