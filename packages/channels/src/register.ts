import { registerProvider } from "."
import { telegramProvider } from "./providers/telegram"
import { slackProvider } from "./providers/slack"
import { discordProvider } from "./providers/discord"
import { whatsappProvider } from "./providers/whatsapp"

export function registerAllProviders() {
  registerProvider(telegramProvider)
  registerProvider(slackProvider)
  registerProvider(discordProvider)
  registerProvider(whatsappProvider)
}
