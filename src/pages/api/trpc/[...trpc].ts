import { simplyFetchFromGraph } from '@lib/crystallize/graph'
import fragments from '@lib/crystallize/graph/fragments'
import { Item, Product } from '@lib/crystallize/types'
import * as trpc from '@trpc/server'
import * as z from 'zod'

// The app's context - is typically generated for each request
export type Context = {}
const createContext = ({
  req,
  res,
}: trpc.CreateNextContextOptions): Context => {
  return {}
}

function createRouter() {
  return trpc.router<Context>()
}
// Important: only use this export with SSR/SSG
export const appRouter = createRouter()
  // Create route at path 'hello'
  .query('hello', {
    // using zod schema to validate and infer input values
    input: z
      .object({
        text: z.string().optional(),
      })
      .optional(),
    resolve({ input }) {
      // the `input` here is parsed by the parser passed in `input` the type inferred
      return {
        greeting: `hello ${input?.text ?? 'world'}`,
      }
    },
  })
  .query('get-all-products', {
    async resolve() {
      const { data } = await simplyFetchFromGraph({
        query: `
          query ALL_CATALOGUE($language: String!, $path: String!,  $version: VersionLabel!) {
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
    async resolve() {
      const { data } = await simplyFetchFromGraph({
        query: `
          query PAGE($language: String!, $path: String!,  $version: VersionLabel!) {
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
        (c) => c.type === 'document',
      ) as Item[]
    },
  })
  .query('get-page', {
    // using zod schema to validate and infer input values
    input: z.object({
      path: z.string(),
    }),
    async resolve({ input }) {
      const { data } = await simplyFetchFromGraph({
        query: `
          query PAGE($language: String!, $path: String!,  $version: VersionLabel!) {
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

// Exporting type _type_ AppRouter only exposes types that can be used for inference
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
export type AppRouter = typeof appRouter

// export API handler
export default trpc.createNextApiHandler({
  router: appRouter,
  createContext,
})
