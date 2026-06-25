import type { Metadata } from "next"
import { WidgetChat } from "./widget-chat"

export const metadata: Metadata = {
  title: "Chat",
}

export default function WidgetPage() {
  return <WidgetChat />
}
