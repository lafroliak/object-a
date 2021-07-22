import * as trpc from '@trpc/server'
import { inferAsyncReturnType } from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import superjson from 'superjson'
import { crystallizeRouter } from '~lib/trpc/crystallizeRouter'
import { stripeRouter } from '~lib/trpc/stripeRouter'
import { geoRouter } from './../../../lib/trpc/geoRouter'
import { shippoRouter } from './../../../lib/trpc/shippoRouter'

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

const router = createRouter()
  .transformer(superjson)
  .merge('crystallize.', crystallizeRouter)
  .merge('stripe.', stripeRouter)
  .merge('shippo.', shippoRouter)
  .merge('geo.', geoRouter)

export const appRouter = router
export type AppRouter = typeof router

export default trpcNext.createNextApiHandler({
  router,
  createContext,
  onError({ error }) {
    console.error('[trpc]: ', error)
  },
  /**
   * Enable query batching
   */
  batching: {
    enabled: true,
  },
})
