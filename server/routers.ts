import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getYahooQuotes } from "./yahooQuotes";
import { getOfficialNav, getRecentHistoryNav } from "./fundNav";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  market: router({
    yahooQuotes: publicProcedure
      .input(z.object({ fund: z.enum(["taiwanTechnology", "taiwanDaba", "taiwanIntelligence", "fuhwaOmni"]).optional(), force: z.boolean().optional() }).optional())
      .query(({ input }) => getYahooQuotes(input?.fund ?? "taiwanTechnology", input?.force ?? false)),
    officialNav: publicProcedure
      .input(z.object({ fund: z.enum(["taiwanTechnology", "taiwanDaba", "taiwanIntelligence", "fuhwaOmni"]).optional(), force: z.boolean().optional() }).optional())
      .query(({ input }) => getOfficialNav(input?.fund ?? "taiwanTechnology", input?.force ?? false)),
    recentHistoryNav: publicProcedure
      .input(z.object({ fund: z.enum(["taiwanTechnology", "taiwanDaba", "taiwanIntelligence", "fuhwaOmni"]).optional(), force: z.boolean().optional() }).optional())
      .query(({ input }) => getRecentHistoryNav(input?.fund ?? "taiwanTechnology", input?.force ?? false)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
