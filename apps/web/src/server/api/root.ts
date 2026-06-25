import { healthRouter } from "./routers/health"
import { workspaceRouter } from "./routers/workspace"
import { agentRouter } from "./routers/agent"
import { conversationRouter } from "./routers/conversation"
import { channelRouter } from "./routers/channel"
import { apiKeyRouter } from "./routers/api-key"
import { dashboardRouter } from "./routers/dashboard"
import { documentRouter } from "./routers/document"
import { analyticsRouter } from "./routers/analytics"
import { router } from "./trpc"

export const appRouter = router({
  health: healthRouter,
  workspace: workspaceRouter,
  agent: agentRouter,
  conversation: conversationRouter,
  channel: channelRouter,
  apiKey: apiKeyRouter,
  dashboard: dashboardRouter,
  document: documentRouter,
  analytics: analyticsRouter,
})

export type AppRouter = typeof appRouter
