import { registerProvider } from "."
import { telegramProvider } from "./providers/telegram"

export function registerAllProviders() {
  registerProvider(telegramProvider)
}
