import Stripe from 'stripe'
import * as z from 'zod'

import { simplyFetchFromGraph } from '~lib/crystallize/graph'
import fragments from '~lib/crystallize/graph/fragments'
import normaliseOrderModel from '~lib/crystallize/normaliseOrderModel'
import {
  createCrystallizeOrder,
  fetchCrystallizeAllOrders,
  fetchCrystallizeOrder,
} from '~lib/crystallize/order'
import { getAllPages, getAllProducts } from '~lib/crystallize/queries'
import { Item, Product } from '~lib/crystallize/types'
import { Mutation, Query, StripePayment } from '~lib/crystallize/types-orders'

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
  .query('get-product', {
    input: z.object({
      path: z.string(),
    }),
    async resolve({ input }) {
      const { data } = await simplyFetchFromGraph({
        query: /* GraphQL */ `
          query PRODUCT(
            $language: String!
            $path: String!
            $version: VersionLabel!
          ) {
            catalogue(path: $path, language: $language, version: $version) {
              ...product
            }
          }

          fragment product on Product {
            id
            name
            variants {
              id
              sku
              priceVariants {
                price
              }
              images {
                url
              }
            }
          }
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
  .mutation('create-order', {
    input: z.object({
      cart: z.unknown(),
      charge: z.unknown(),
    }),
    async resolve({ input }): Promise<string> {
      const normalizedInput = normaliseOrderModel({
        cart: input.cart as Product[],
        charge: input.charge as Stripe.Charge,
      })

      const { data } = await createCrystallizeOrder(normalizedInput)

      return (data as Mutation).orders.create.id
    },
  })
  .query('get-order', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { data } = await fetchCrystallizeOrder(input.id)
      return (data as Query).orders.get
    },
  })
  .mutation('order-by-payment-id', {
    input: z.object({
      paymentIntentId: z.string(),
    }),
    async resolve({ input }) {
      const { data } = await fetchCrystallizeAllOrders()
      return (data as Query).orders.getAll.edges?.find(
        ({ node }) =>
          (node.payment?.[0] as StripePayment).paymentIntentId ===
          input.paymentIntentId,
      )
    },
  })
