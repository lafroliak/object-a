import { simplyFetchFromGraph } from '@lib/crystallize/graph'
import fragments from '@lib/crystallize/graph/fragments'
import { Item, Product } from '@lib/crystallize/types'
import { createRouter } from '../../pages/api/trpc/[trpc]'
import * as z from 'zod'
import { getAllPages } from '@lib/crystallize/queries'

// Important: only use this export with SSR/SSG
export const crystallizeRouter = createRouter()
  .query('get-all-products', {
    async resolve({ ctx }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate',
      )

      const { data } = await simplyFetchFromGraph({
        query: /* GraphQL */ `
          query ALL_CATALOGUE(
            $language: String!
            $path: String!
            $version: VersionLabel!
          ) {
            catalogue(path: $path, language: $language, version: $version) {
              ...item
              ...product

              children {
                ...item
                ...product
              }
            }
          }

          ${fragments}
        `,
        variables: {
          language: 'en',
          path: '/',
          version: 'published',
        },
      })

      return data.catalogue?.children?.filter(
        (c) => c.type === 'product',
      ) as Product[]
    },
  })
  .query('get-all-pages', {
    async resolve({ ctx }) {
      // ctx.res?.setHeader(
      //   'Cache-Control',
      //   'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      // )

      const pages = await getAllPages();

      return {
        pages,
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
