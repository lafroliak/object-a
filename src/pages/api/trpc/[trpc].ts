import * as trpc from '@trpc/server'
import { inferAsyncReturnType } from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import superjson from 'superjson'

import { crystallizeRouter } from '~lib/trpc/crystallizeRouter'

// create context based of incoming request
// set as optional here so it can also be re-used for `getStaticProps()`
export async function createContext(opts?: trpcNext.CreateNextContextOptions) {
  return {
    req: opts?.req,
    res: opts?.res,
  }
}
type Context = inferAsyncReturnType<typeof createContext>

export function createRouter() {
  return trpc.router<Context>()
}

const router = createRouter().merge('crystallize.', crystallizeRouter)

export const appRouter = router
export type AppRouter = typeof router

export default trpcNext.createNextApiHandler({
  router,
  createContext,
  transformer: superjson,
  onError({ error }) {
    console.error('[trpc]: ', error)
  },
})
