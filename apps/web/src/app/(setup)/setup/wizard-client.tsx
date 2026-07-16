"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { ExpandableError } from "./expandable-error"
import {
  createAccountAction,
  testDbConnectionAction,
  testProviderConnectionAction,
  finalizeSetupAction,
} from "@/lib/actions/setup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

type TestState = {
  status: "idle" | "testing" | "passed" | "failed"
  message?: string
  details?: string
}

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
  const [dbTest, setDbTest] = useState<TestState>({ status: "idle" })
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
      setDbTest({
        status: "failed",
        message: result.error ?? "Connection failed",
        details: (result as any).details,
      })
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
      const result = await createAccountAction({
        email: data.email,
        name: data.name,
        password: data.password,
      })
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

  function TestButton({
    state,
    onTest,
    label,
  }: {
    state: TestState
    onTest: () => void
    label: string
  }) {
    return (
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={onTest}
          disabled={state.status === "testing"}
          variant="secondary"
          size="sm"
        >
          {state.status === "testing" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing...
            </span>
          ) : (
            label
          )}
        </Button>
        {state.status === "passed" && <Badge variant="success">Connected</Badge>}
        {state.status === "failed" && state.message && (
          <span className="text-danger-text text-sm">{state.message}</span>
        )}
        {state.status === "failed" && state.details && (
          <ExpandableError message={state.message ?? ""} details={state.details} />
        )}
      </div>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-xl shadow-xl">
      <CardHeader className="border-border border-b p-6 pb-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-text-primary text-sm font-semibold">ChasteAI Setup</span>
          <span className="text-text-muted text-xs">
            Step {step} of {STEPS.length}
          </span>
        </div>
        <div className="flex w-full items-center gap-1">
          {STEPS.map((label, i) => {
            const idx = i + 1
            const active = idx === step
            const done = idx < step
            return (
              <div key={label} className="flex flex-1 items-center gap-1">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                    active
                      ? "bg-accent text-accent-text"
                      : done
                        ? "bg-surface-high text-text-secondary"
                        : "border-border text-text-muted border bg-transparent"
                  }`}
                >
                  {done ? <Check className="h-3 w-3" /> : idx}
                </div>
                {idx < STEPS.length && (
                  <div
                    className={`h-[2px] flex-1 transition-colors ${done ? "bg-accent-subtle" : "bg-border"}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-text-primary font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
                Create your account
              </h2>
              <p className="text-text-muted mt-1 text-[13px]">This will be your admin account.</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                  Email
                </label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => update({ email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                  Name
                </label>
                <Input
                  type="text"
                  value={data.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="Admin"
                />
              </div>
              <div>
                <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                  Password
                </label>
                <Input
                  type="password"
                  value={data.password}
                  onChange={(e) => update({ password: e.target.value })}
                  placeholder="At least 8 characters"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-text-primary font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
                Database
              </h2>
              <p className="text-text-muted mt-1 text-[13px]">
                {initialDbUrl
                  ? "Database configured via terminal. Test the connection to verify."
                  : "Run pnpm setup:db in your terminal to configure a database."}
              </p>
            </div>
            {initialDbUrl ? (
              <div className="border-border bg-surface-elevated rounded-lg border p-4">
                <p className="text-text-secondary text-xs font-medium">Connection string</p>
                <p className="text-text-primary mt-1 truncate font-mono text-sm">{initialDbUrl}</p>
                <div className="mt-4">
                  <TestButton state={dbTest} onTest={testDb} label="Test Connection" />
                </div>
                <p className="text-text-muted mt-4 text-[13px]">
                  You can migrate to PostgreSQL later from your dashboard settings.
                </p>
              </div>
            ) : (
              <div className="border-border bg-surface-elevated rounded-lg border p-4 text-center">
                <p className="text-text-secondary text-sm">
                  Run{" "}
                  <code className="bg-surface-high text-accent rounded px-1.5 py-0.5 text-xs">
                    pnpm setup:db
                  </code>{" "}
                  to set up SQLite or Turso.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-text-primary font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
                AI Provider
              </h2>
              <p className="text-text-muted mt-1 text-[13px]">
                Select a provider and enter your API key. Test the connection before continuing.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                  Provider
                </label>
                <select
                  value={data.providerPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="border-border bg-bg focus-visible:ring-accent focus-visible:border-accent flex h-9 w-full rounded-lg border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
                >
                  {PROVIDER_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              {data.providerPreset === "custom" && (
                <div>
                  <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                    Base URL
                  </label>
                  <Input
                    type="text"
                    value={data.baseUrl}
                    onChange={(e) => update({ baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
              )}
              <div>
                <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                  API Key
                </label>
                <Input
                  type="password"
                  value={data.apiKey}
                  onChange={(e) => update({ apiKey: e.target.value })}
                  placeholder="sk-..."
                />
              </div>
              {(data.providerPreset === "custom" || data.baseUrl) && (
                <div>
                  <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                    Model
                  </label>
                  <Input
                    type="text"
                    value={data.model}
                    onChange={(e) => update({ model: e.target.value })}
                    placeholder="gpt-4o"
                  />
                </div>
              )}
            </div>
            <div className="mt-2">
              <TestButton state={providerTest} onTest={testProvider} label="Test Connection" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-text-primary font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
                Workspace & Agent
              </h2>
              <p className="text-text-muted mt-1 text-[13px]">
                Set up your first workspace and agent.
              </p>
            </div>
            <div>
              <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                Workspace name
              </label>
              <Input
                type="text"
                value={data.workspaceName}
                onChange={(e) => update({ workspaceName: e.target.value })}
              />
            </div>
            <div className="border-border mt-2 border-t pt-4">
              <h3 className="text-text-primary mb-3 text-sm font-semibold">First Agent</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={data.agentName}
                    onChange={(e) => update({ agentName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                    Description
                  </label>
                  <Input
                    type="text"
                    value={data.agentDescription}
                    onChange={(e) => update({ agentDescription: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-text-secondary mb-1 block text-[13px] font-medium">
                    System prompt
                  </label>
                  <textarea
                    value={data.systemPrompt}
                    onChange={(e) => update({ systemPrompt: e.target.value })}
                    rows={3}
                    className="border-border bg-bg focus-visible:ring-accent focus-visible:border-accent flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
                    placeholder="You are a helpful support agent..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 py-6 text-center">
            <div className="bg-success-subtle ring-success-border text-success-text mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full ring-1">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-text-primary font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
                All set!
              </h2>
              <p className="text-text-muted mx-auto mt-2 max-w-sm text-sm">
                Your workspace is ready. Click below to go to your dashboard.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6">
            {errorDetails ? (
              <ExpandableError message={error} details={errorDetails} />
            ) : (
              <div className="border-danger bg-danger-subtle text-danger-text rounded-lg border p-3 text-[13px]">
                {error}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-border bg-surface-elevated flex items-center justify-between rounded-b-lg border-t p-6 pt-4">
        {step > 1 && step < 5 ? (
          <Button variant="subtle" onClick={handleBack} disabled={busy}>
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button onClick={handleNext} disabled={busy} loading={busy}>
          {step === 5 ? "Go to Dashboard" : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  )
}
