import { healthRouter } from "./routers/health"
import { authRouter } from "./routers/auth"
import { workspaceRouter } from "./routers/workspace"
import { agentRouter } from "./routers/agent"
import { agentKnowledgeRouter } from "./routers/agent-knowledge"
import { conversationRouter } from "./routers/conversation"
import { channelRouter } from "./routers/channel"
import { apiKeyRouter } from "./routers/api-key"
import { dashboardRouter } from "./routers/dashboard"
import { documentRouter } from "./routers/document"
import { analyticsRouter } from "./routers/analytics"
import { securityCodesRouter } from "./routers/security-codes"
import { router } from "./trpc"

export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  workspace: workspaceRouter,
  agent: agentRouter,
  agentKnowledge: agentKnowledgeRouter,
  conversation: conversationRouter,
  channel: channelRouter,
  apiKey: apiKeyRouter,
  dashboard: dashboardRouter,
  document: documentRouter,
  analytics: analyticsRouter,
  securityCodes: securityCodesRouter,
})

export type AppRouter = typeof appRouter
