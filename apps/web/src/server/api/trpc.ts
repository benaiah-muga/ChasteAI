import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"
import { getDatabaseClient } from "@chaste-ai/db"
import type { DatabaseClient } from "@chaste-ai/db"

type CreateContextOptions = {
  session: Session | null
  db: DatabaseClient
}

export async function createInnerTRPCContext(opts: CreateContextOptions) {
  return {
    session: opts.session,
    db: opts.db,
  }
}

export async function createTRPCContext(_opts: { req: Request; resHeaders: Headers }) {
  const session = null
  const db = getDatabaseClient()
  return createInnerTRPCContext({ session, db })
}

const t = initTRPC.context<typeof createInnerTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

type Session = {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
} | null
