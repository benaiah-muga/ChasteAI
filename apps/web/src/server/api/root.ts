import { healthRouter } from "./routers/health"
import { workspaceRouter } from "./routers/workspace"
import { agentRouter } from "./routers/agent"
import { conversationRouter } from "./routers/conversation"
import { channelRouter } from "./routers/channel"
import { router } from "./trpc"

export const appRouter = router({
  health: healthRouter,
  workspace: workspaceRouter,
  agent: agentRouter,
  conversation: conversationRouter,
  channel: channelRouter,
})

export type AppRouter = typeof appRouter
