import { simplyFetchFromGraph } from '@lib/crystallize/graph'
import fragments from '@lib/crystallize/graph/fragments'
import { getAllPages, getAllProducts } from '@lib/crystallize/queries'
import { Item } from '@lib/crystallize/types'
import * as z from 'zod'

import { createRouter } from '../../pages/api/trpc/[trpc]'

// Important: only use this export with SSR/SSG
export const crystallizeRouter = createRouter()
  .query('get-all-products', {
    async resolve({ ctx }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const products = await getAllProducts()

      return {
        products,
        lastUpdated: new Date().toJSON(),
      }
    },
  })
  .query('get-all-pages', {
    async resolve({ ctx }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const pages = await getAllPages()

      return {
        pages: pages,
        lastUpdated: new Date().toJSON(),
      }
    },
  })
  .query('get-page', {
    input: z.object({
      path: z.string(),
    }),
    async resolve({ ctx, input }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const { data } = await simplyFetchFromGraph({
        query: /* GraphQL */ `
          query PAGE(
            $language: String!
            $path: String!
            $version: VersionLabel!
          ) {
            catalogue(path: $path, language: $language, version: $version) {
              ...item
              ...product
            }
          }

          ${fragments}
        `,
        variables: {
          language: 'en',
          path: input.path,
          version: 'published',
        },
      })

      return data.catalogue as Item
    },
  })
