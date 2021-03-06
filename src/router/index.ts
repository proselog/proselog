import * as trpc from "@trpc/server"
import { z, ZodError } from "zod"
import { isNotFoundError } from "~/lib/server-side-props"
import { TRPCContext } from "~/lib/trpc.server"
import { getSite } from "~/models/site.model"
import { authRouter } from "./auth"
import { membershipRouter } from "./membership"
import { pageRouter } from "./page"
import { siteRouter } from "./site"
import { userRouter } from "./user"

export const appRouter = trpc
  .router<TRPCContext>()
  .query("site", {
    input: z.object({
      site: z.string(),
    }),
    output: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      icon: z.string().nullable(),
      subdomain: z.string(),
      navigation: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            url: z.string(),
          })
        )
        .nullable(),
    }),
    async resolve({ input }) {
      const site = await getSite(input.site)
      return site
    },
  })
  .merge("auth.", authRouter)
  .merge("site.", siteRouter)
  .merge("user.", userRouter)
  .merge("membership.", membershipRouter)
  .merge("page.", pageRouter)
  .formatError(({ error, shape }) => {
    const isZodError = error.cause instanceof ZodError
    return {
      ...shape,
      message: isZodError
        ? error.cause.issues.map((i) => i.message).join(", ")
        : error.message,
      data: {
        ...shape.data,
        notFound: isNotFoundError(error.cause),
      },
    }
  })

// export type definition of API
export type AppRouter = typeof appRouter
