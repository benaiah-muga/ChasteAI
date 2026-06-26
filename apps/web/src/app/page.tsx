import Link from "next/link"
import { auth } from "@/auth"

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <span className="text-sm font-semibold tracking-tight text-neutral-900">
          ChasteAI
        </span>
        <nav className="flex items-center gap-4">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pt-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Open-source AI customer support
          </h1>
          <p className="mt-4 text-lg text-neutral-500">
            Self-host your own AI support infrastructure.
            Configure providers, deploy agents, and manage conversations.
          </p>
        </section>

        <section className="mx-auto mt-16 grid max-w-4xl gap-4 px-6 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <span className="text-lg font-bold">1</span>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-neutral-900">Setup</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Run the setup wizard to configure your database and create your admin account.
            </p>
            <Link
              href="/setup"
              className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Open setup wizard &rarr;
            </Link>
          </div>
          <div className="rounded-xl border border-neutral-200 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <span className="text-lg font-bold">2</span>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-neutral-900">Configure providers</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Add your AI provider keys (OpenAI, Groq, or any compatible API).
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <span className="text-lg font-bold">3</span>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-neutral-900">Create agents</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Design support agents with custom prompts and channel configurations.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <span className="text-lg font-bold">4</span>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-neutral-900">Deploy & monitor</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Embed widgets, connect channels, and monitor conversations in real time.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl px-6 pb-24">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <h3 className="text-sm font-semibold text-neutral-900">Getting started</h3>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-neutral-600">
                Quick start with SQLite (zero config):
              </p>
              <pre className="rounded-lg bg-neutral-900 p-4 text-sm text-neutral-200">
                {`pnpm setup
pnpm dev`}
              </pre>
              <p className="text-sm text-neutral-500">
                Then open{" "}
                <Link href="/setup" className="text-indigo-600 hover:underline">
                  /setup
                </Link>{" "}
                in your browser.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 px-6 py-4 text-center text-xs text-neutral-400">
        ChasteAI &mdash; open-source AI customer support infrastructure
      </footer>
    </div>
  )
}
