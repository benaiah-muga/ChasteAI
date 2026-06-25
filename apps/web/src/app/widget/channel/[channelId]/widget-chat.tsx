"use client"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

function getApiOrigin() {
  if (typeof window === "undefined") return ""
  return window.location.origin
}

export function WidgetChat() {
  const params = useParams<{ channelId: string }>()
  const channelId = params.channelId
  const apiOrigin = getApiOrigin()

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
        <div
          style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Chat</p>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            gap: 12,
          }}
        >
          <p style={{ fontSize: 14, color: "#64748b", textAlign: "center" }}>
            Have a question? Start a conversation.
          </p>
          <button
            onClick={startConversation}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "#6366f1",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
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
      <div
        style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Chat</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                  padding: "8px 14px",
                  borderRadius: 16,
                  fontSize: 14,
                  lineHeight: 1.5,
                  ...(msg.role === "user"
                    ? { background: "#6366f1", color: "#fff" }
                    : msg.role === "system"
                      ? { background: "#f1f5f9", color: "#ef4444" }
                      : { background: "#f1f5f9", color: "#0f172a" }),
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
                  padding: "8px 14px",
                  borderRadius: 16,
                  fontSize: 14,
                  lineHeight: 1.5,
                  background: "#f1f5f9",
                  color: "#0f172a",
                }}
              >
                {streamingContent}
                <span
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 14,
                    marginLeft: 2,
                    background: "#6366f1",
                    animation: "pulse 1s infinite",
                  }}
                />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0" }}>
        <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isStreaming}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: !input.trim() || isStreaming ? "#c7d2fe" : "#6366f1",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: !input.trim() || isStreaming ? "default" : "pointer",
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
