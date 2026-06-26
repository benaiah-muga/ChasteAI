"use client"

import { useState } from "react"
import { ExpandableError } from "./expandable-error"
import { createAccountAction, testDbConnectionAction, testProviderConnectionAction, finalizeSetupAction } from "@/lib/actions/setup"

const STEPS = ["Account", "Database", "Provider", "Workspace", "Done"]

const PROVIDER_PRESETS = [
  {
    value: "openai",
    label: "OpenAI",
    type: "openai",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
  },
  {
    value: "groq",
    label: "Groq",
    type: "openai-compatible",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "mixtral-8x7b-32768",
  },
  {
    value: "nvidia",
    label: "NVIDIA",
    type: "openai-compatible",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    model: "nvidia/llama-3.1-nemotron-70b-instruct",
  },
  {
    value: "together",
    label: "Together AI",
    type: "openai-compatible",
    baseUrl: "https://api.together.xyz/v1",
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
  },
  {
    value: "fireworks",
    label: "Fireworks AI",
    type: "openai-compatible",
    baseUrl: "https://api.fireworks.ai/inference/v1",
    model: "accounts/fireworks/models/llama-v3p1-8b-instruct",
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    type: "openai-compatible",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
  },
  {
    value: "mistral",
    label: "Mistral AI",
    type: "openai-compatible",
    baseUrl: "https://api.mistral.ai/v1",
    model: "mistral-large-latest",
  },
  {
    value: "custom",
    label: "Custom (OpenAI Compatible)",
    type: "openai-compatible",
    baseUrl: "",
    model: "",
  },
] as const

type WizardData = {
  email: string
  name: string
  password: string
  workspaceName: string
  agentName: string
  agentDescription: string
  systemPrompt: string
  providerPreset: string
  providerType: string
  apiKey: string
  baseUrl: string
  model: string
}

type TestState = { status: "idle" | "testing" | "passed" | "failed"; message?: string; details?: string }

export function WizardClient({ initialDbUrl }: { initialDbUrl?: string }) {
  const [step, setStep] = useState(initialDbUrl ? 1 : 2)
  const [data, setData] = useState<WizardData>({
    email: "",
    name: "",
    password: "",
    workspaceName: "My Workspace",
    agentName: "Support Agent",
    agentDescription: "",
    systemPrompt: "",
    providerPreset: "openai",
    providerType: "openai",
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
  })
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dbTest, setDbTest] = useState<TestState>({ status: initialDbUrl ? "passed" : "idle" })
  const [providerTest, setProviderTest] = useState<TestState>({ status: "idle" })

  function update(fields: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...fields }))
    setError(null)
    setErrorDetails(null)
  }

  function handlePresetChange(value: string) {
    const preset = PROVIDER_PRESETS.find((p) => p.value === value)
    if (!preset) return
    setData((prev) => ({
      ...prev,
      providerPreset: preset.value,
      providerType: preset.type,
      baseUrl: preset.baseUrl,
      model: preset.model,
    }))
    setProviderTest({ status: "idle" })
  }

  async function testDb() {
    if (!initialDbUrl) return
    setDbTest({ status: "testing" })
    const result = await testDbConnectionAction({ url: initialDbUrl })
    if ("success" in result && result.success) {
      setDbTest({ status: "passed" })
    } else {
      setDbTest({ status: "failed", message: result.error ?? "Connection failed", details: (result as any).details })
    }
  }

  async function testProvider() {
    if (!data.apiKey) {
      setProviderTest({ status: "failed", message: "Enter an API key first." })
      return
    }
    setProviderTest({ status: "testing" })
    const result = await testProviderConnectionAction({
      type: data.providerType,
      apiKey: data.apiKey,
      baseUrl: data.baseUrl,
      model: data.model,
    })
    if ("success" in result && result.success) {
      setProviderTest({ status: "passed" })
    } else {
      setProviderTest({
        status: "failed",
        message: result.error ?? "Connection test failed",
        details: (result as any).details,
      })
    }
  }

  async function handleNext() {
    setError(null)
    setErrorDetails(null)

    if (step === 1) {
      if (!data.email || !data.password) {
        setError("Email and password are required")
        return
      }
      if (data.password.length < 8) {
        setError("Password must be at least 8 characters")
        return
      }
      setBusy(true)
      const result = await createAccountAction({ email: data.email, name: data.name, password: data.password })
      setBusy(false)
      if ("error" in result && result.error) {
        setError(result.error)
        return
      }
    }

    if (step === 2) {
      if (dbTest.status !== "passed") {
        setError("Test the database connection before continuing.")
        return
      }
    }

    if (step === 3) {
      if (providerTest.status !== "passed") {
        setError("Test the provider connection before continuing.")
        return
      }
    }

    if (step === 5) {
      setBusy(true)
      const result = await finalizeSetupAction({
        workspaceName: data.workspaceName,
        agentName: data.agentName,
        agentDescription: data.agentDescription,
        systemPrompt: data.systemPrompt,
        providerType: data.providerType,
        apiKey: data.apiKey,
        baseUrl: data.baseUrl,
        model: data.model,
      })
      setBusy(false)
      if ("error" in result) {
        setError(result.error ?? "Failed to complete setup")
        setErrorDetails((result as any).details ?? null)
        return
      }
      window.location.href = "/dashboard"
      return
    }

    setStep((s) => Math.min(s + 1, 5) as any)
  }

  function handleBack() {
    setError(null)
    setErrorDetails(null)
    setStep((s) => Math.max(s - 1, 1) as any)
  }

  function TestButton({ state, onTest, label }: { state: TestState; onTest: () => void; label: string }) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onTest}
          disabled={state.status === "testing"}
          className="rounded-lg border border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white disabled:opacity-50"
        >
          {state.status === "testing" ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
              Testing...
            </span>
          ) : (
            label
          )}
        </button>
        {state.status === "passed" && <span className="text-sm text-green-400">Connected</span>}
        {state.status === "failed" && state.message && (
          <span className="text-sm text-red-400">{state.message}</span>
        )}
        {state.status === "failed" && state.details && (
          <ExpandableError message={state.message ?? ""} details={state.details} />
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
      <div className="border-b border-neutral-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">ChasteAI</span>
          <span className="text-xs text-neutral-500">Step {step} of {STEPS.length}</span>
        </div>
        <div className="mt-3 flex items-center gap-1">
          {STEPS.map((label, i) => {
            const idx = i + 1
            const active = idx === step
            const done = idx < step
            return (
              <div key={label} className="flex items-center gap-1 flex-1">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                    active ? "bg-indigo-600 text-white" : done ? "bg-indigo-950 text-indigo-400" : "bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {done ? "✓" : idx}
                </div>
                {idx < STEPS.length && <div className={`h-px flex-1 ${done ? "bg-indigo-800" : "bg-neutral-800"}`} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="px-6 py-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Create your account</h2>
              <p className="mt-1 text-sm text-neutral-400">This will be your admin account.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">Email</label>
              <input type="email" value={data.email} onChange={(e) => update({ email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                placeholder="admin@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">Name</label>
              <input type="text" value={data.name} onChange={(e) => update({ name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                placeholder="Admin" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">Password</label>
              <input type="password" value={data.password} onChange={(e) => update({ password: e.target.value })}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                placeholder="At least 8 characters" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Database</h2>
              <p className="mt-1 text-sm text-neutral-400">
                {initialDbUrl
                  ? "Database configured via terminal. Test the connection to verify."
                  : "Run pnpm setup:db in your terminal to configure a database."}
              </p>
            </div>
            {initialDbUrl ? (
              <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-3">
                <p className="text-xs font-medium text-neutral-400">Connection string</p>
                <p className="mt-1 text-sm text-neutral-200 font-mono truncate">{initialDbUrl}</p>
                <div className="mt-3">
                  <TestButton state={dbTest} onTest={testDb} label="Test Connection" />
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                  You can migrate to PostgreSQL later from your dashboard settings.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-4 text-center">
                <p className="text-sm text-neutral-300">
                  Run <code className="rounded bg-neutral-700 px-1.5 py-0.5 text-xs text-indigo-300">pnpm setup:db</code> to set up SQLite or Turso.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">AI Provider</h2>
              <p className="mt-1 text-sm text-neutral-400">Select a provider and enter your API key. Test the connection before continuing.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">Provider</label>
              <select
                value={data.providerPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {PROVIDER_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            {data.providerPreset === "custom" && (
              <div>
                <label className="block text-sm font-medium text-neutral-300">Base URL</label>
                <input type="text" value={data.baseUrl} onChange={(e) => update({ baseUrl: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="https://api.openai.com/v1" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-300">API Key</label>
              <input type="password" value={data.apiKey} onChange={(e) => update({ apiKey: e.target.value })}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                placeholder="sk-..." />
            </div>
            {(data.providerPreset === "custom" || data.baseUrl) && (
              <div>
                <label className="block text-sm font-medium text-neutral-300">Model</label>
                <input type="text" value={data.model} onChange={(e) => update({ model: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="gpt-4o" />
              </div>
            )}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={testProvider}
                disabled={providerTest.status === "testing" || !data.apiKey}
                className="rounded-lg border border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white disabled:opacity-50"
              >
                {providerTest.status === "testing" ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
                    Testing...
                  </span>
                ) : (
                  "Test Connection"
                )}
              </button>
              {providerTest.status === "passed" && <span className="text-sm text-green-400">Connected</span>}
            </div>
            {providerTest.status === "failed" && (
              <ExpandableError
                message={providerTest.message ?? "Connection test failed"}
                details={providerTest.details ?? "Unknown error"}
              />
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Workspace & Agent</h2>
              <p className="mt-1 text-sm text-neutral-400">Set up your first workspace and agent.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">Workspace name</label>
              <input type="text" value={data.workspaceName} onChange={(e) => update({ workspaceName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none" />
            </div>
            <div className="border-t border-neutral-800 pt-4">
              <h3 className="text-sm font-semibold text-white">First Agent</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">Name</label>
              <input type="text" value={data.agentName} onChange={(e) => update({ agentName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">Description</label>
              <input type="text" value={data.agentDescription} onChange={(e) => update({ agentDescription: e.target.value })}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">System prompt</label>
              <textarea value={data.systemPrompt} onChange={(e) => update({ systemPrompt: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                placeholder="You are a helpful support agent..." />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-950">
              <span className="text-2xl text-green-400">✓</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">All set!</h2>
              <p className="mt-1 text-sm text-neutral-400">Your workspace is ready. Click below to go to your dashboard.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4">
            {errorDetails ? (
              <ExpandableError message={error} details={errorDetails} />
            ) : (
              <div className="rounded-lg border border-red-800 bg-red-950/50 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-4">
        {step > 1 && step < 5 ? (
          <button type="button" onClick={handleBack} disabled={busy}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white disabled:opacity-50">
            Back
          </button>
        ) : (
          <div />
        )}
        <button type="button" onClick={handleNext} disabled={busy}
          className={`rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors ${
            busy ? "bg-indigo-800 cursor-wait" : "bg-indigo-600 hover:bg-indigo-500"
          }`}>
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {step === 5 ? "Finalizing..." : "Working..."}
            </span>
          ) : step === 5 ? (
            "Go to Dashboard"
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  )
}
