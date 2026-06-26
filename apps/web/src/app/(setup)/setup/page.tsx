import { WizardClient } from "./wizard-client"
import { readFileSync, existsSync } from "fs"
import { resolve } from "path"

function getInitialDbUrl(): string | undefined {
  const envPath = resolve(process.cwd(), ".env")
  if (!existsSync(envPath)) return undefined
  const content = readFileSync(envPath, "utf-8")
  const match = content.match(/^DATABASE_URL=(.+)$/m)
  return match?.[1] ?? undefined
}

export default function SetupPage() {
  const initialDbUrl = getInitialDbUrl()

  return (
    <div>
      <WizardClient initialDbUrl={initialDbUrl} />
    </div>
  )
}
