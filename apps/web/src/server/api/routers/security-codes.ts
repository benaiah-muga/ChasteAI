import { eq, and, isNull } from "drizzle-orm"
import { hash, compare } from "bcryptjs"
import { securityCodes, user } from "@chaste-ai/db"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { protectedProcedure, publicProcedure, router } from "../trpc"

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `${segment()}-${segment()}`
}

function generateCodes(count: number): string[] {
  return Array.from({ length: count }, generateCode)
}

export const securityCodesRouter = router({
  generate: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const codes = generateCodes(10)

    const rows = await Promise.all(
      codes.map(async (code) => {
        const codeHash = await hash(code, 10)
        return {
          userId,
          codeHash,
          codePrefix: code.slice(0, 4),
        }
      }),
    )

    await ctx.db.insert(securityCodes).values(rows)

    return { codes }
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const all = await ctx.db
      .select({
        id: securityCodes.id,
        codePrefix: securityCodes.codePrefix,
        usedAt: securityCodes.usedAt,
        createdAt: securityCodes.createdAt,
      })
      .from(securityCodes)
      .where(eq(securityCodes.userId, userId))

    return {
      total: all.length,
      unused: all.filter((c) => !c.usedAt).length,
      used: all.filter((c) => !!c.usedAt).length,
      codes: all,
    }
  }),

  revoke: protectedProcedure
    .input(z.object({ codeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const [code] = await ctx.db
        .select()
        .from(securityCodes)
        .where(and(eq(securityCodes.id, input.codeId), eq(securityCodes.userId, userId)))
        .limit(1)

      if (!code) throw new TRPCError({ code: "NOT_FOUND" })
      if (code.usedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Code already used" })

      await ctx.db
        .update(securityCodes)
        .set({ usedAt: new Date() })
        .where(eq(securityCodes.id, input.codeId))
    }),

  verify: publicProcedure
    .input(z.object({ email: z.string().email(), code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [found] = await ctx.db.select().from(user).where(eq(user.email, input.email)).limit(1)

      if (!found) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid email or code" })

      const unusedCodes = await ctx.db
        .select()
        .from(securityCodes)
        .where(and(eq(securityCodes.userId, found.id), isNull(securityCodes.usedAt)))

      for (const sc of unusedCodes) {
        const valid = await compare(input.code, sc.codeHash)
        if (valid) {
          await ctx.db
            .update(securityCodes)
            .set({ usedAt: new Date() })
            .where(eq(securityCodes.id, sc.id))

          return {
            user: {
              id: found.id,
              email: found.email,
              name: found.name,
              image: found.image,
            },
          }
        }
      }

      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or code" })
    }),
})
