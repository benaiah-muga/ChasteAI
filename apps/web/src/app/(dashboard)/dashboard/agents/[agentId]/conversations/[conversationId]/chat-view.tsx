"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

type Message = {
  id: string
  conversationId: string
  role: string
  content: string
  createdAt: Date
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[#6366f1] text-white"
            : isAssistant
              ? "bg-[#f1f5f9] text-[#0f172a]"
              : "bg-[#f8fafc] text-[#64748b]"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={`mt-1 text-right text-[10px] ${isUser ? "text-[#c7d2fe]" : "text-[#94a3b8]"}`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}

export function ChatView({
  agentId,
  agentName,
  conversationId,
  initialMessages,
}: {
  agentId: string
  agentName: string
  conversationId: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userContent = input.trim()
    setInput("")

    const optimisticUser: Message = {
      id: `optimistic-${Date.now()}`,
      conversationId,
      role: "user",
      content: userContent,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, optimisticUser])
    setIsStreaming(true)
    setStreamingContent("")

    try {
      const response = await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userContent }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      if (response.body) {
        const reader = response.body.getReader()
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
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6))
              if (data.token) {
                fullContent += data.token
                setStreamingContent(fullContent)
              } else if (data.done) {
                const assistantMessage: Message = {
                  id: data.messageId,
                  conversationId,
                  role: "assistant",
                  content: fullContent,
                  createdAt: new Date(),
                }
                setMessages((prev) => [...prev, assistantMessage])
                setStreamingContent("")
              } else if (data.error) {
                throw new Error(data.error)
              }
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          conversationId,
          role: "system",
          content: "Failed to get response. Please try again.",
          createdAt: new Date(),
        },
      ])
    } finally {
      setIsStreaming(false)
      setStreamingContent("")
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-4xl flex-col">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-white px-8 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/agents/${agentId}/conversations`}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#64748b] hover:text-[#0f172a]"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Back
          </Link>
          <span className="text-sm font-medium text-[#0f172a]">{agentName}</span>
        </div>
        <span className="text-xs text-[#94a3b8]">
          {messages.filter((m) => m.role !== "system").length} messages
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl bg-[#f1f5f9] px-4 py-2.5 text-sm leading-relaxed text-[#0f172a]">
                <p className="whitespace-pre-wrap">{streamingContent}</p>
                <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-[#6366f1]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-[#e2e8f0] bg-white px-8 py-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isStreaming}
            className="block flex-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:bg-white focus:ring-1 focus:ring-[#6366f1] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#6366f1] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4f46e5] disabled:opacity-50"
          >
            {isStreaming ? (
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Sending
              </span>
            ) : (
              <>
                Send
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
