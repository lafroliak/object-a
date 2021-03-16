import { createReactQueryHooks, createTRPCClient } from '@trpc/react'
import { QueryClient } from 'react-query'

// Type-only import:
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
import type { AppRouter } from '../../pages/api/trpc/[trpc]'

export const client = createTRPCClient<AppRouter>({
  url: '/api/trpc',
})

export const trpc = createReactQueryHooks<AppRouter>({
  client,
  queryClient: new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: Infinity,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        notifyOnChangeProps: ['data', 'error'],
      },
    },
  }),
})
