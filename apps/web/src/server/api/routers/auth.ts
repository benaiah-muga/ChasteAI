import { protectedProcedure, router } from "../trpc"

export const authRouter = router({
  session: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.session.user,
    }
  }),
})
