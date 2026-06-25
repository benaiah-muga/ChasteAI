import { healthRouter } from "./routers/health"
import { workspaceRouter } from "./routers/workspace"
import { router } from "./trpc"

export const appRouter = router({
  health: healthRouter,
  workspace: workspaceRouter,
})

export type AppRouter = typeof appRouter
