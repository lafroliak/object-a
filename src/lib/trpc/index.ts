import { createReactQueryHooks, createTRPCClient } from '@trpc/react'
import superjson from 'superjson'

import type { AppRouter } from '../../pages/api/trpc/[trpc]'

export const client = createTRPCClient<AppRouter>({
  url: '/api/trpc',
  transformer: superjson,
})

export const trpc = createReactQueryHooks({
  client,
})
