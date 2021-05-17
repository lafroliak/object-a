import Stripe from 'stripe'
import * as z from 'zod'

import { stripe } from '~lib/stripe/createClient'

import { createRouter } from '../../pages/api/trpc/[trpc]'
import ALLOWED_COUNTRY from '../stripe/allowedCountries'

// Important: only use this export with SSR/SSG
export const stripeRouter = createRouter()
  .query('checkout-session', {
    input: z.object({
      sessionId: z.string().optional(),
    }),
    async resolve({ input }) {
      if (!input.sessionId) return

      const session = await stripe.checkout.sessions.retrieve(input.sessionId)

      return session
    },
  })
  .mutation('payment-intents', {
    input: z.object({
      paymentIntentId: z.string().optional(),
    }),
    async resolve({ input }) {
      if (!input.paymentIntentId) return

      const paymentIntent = await stripe.paymentIntents.retrieve(
        input.paymentIntentId,
      )

      return paymentIntent.charges
    },
  })
  .mutation('create-checkout-session', {
    input: z.object({
      email: z.string().email(),
      items: z.array(
        z.object({
          price_data: z
            .object({
              currency: z.string(),
              product_data: z
                .object({
                  name: z.string(),
                  metadata: z.any(),
                  images: z.array(z.string()).optional(),
                })
                .optional(),
              unit_amount: z.number().optional(),
            })
            .optional(),
          quantity: z.number().optional(),
        }),
      ),
      skus: z.string(),
    }),
    async resolve({ input }) {
      const options: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        // shipping_rates: [process.env.SHIPPING_RATE || ''],
        billing_address_collection: 'auto',
        shipping_address_collection: {
          allowed_countries: ALLOWED_COUNTRY,
        },
        customer_email: input.email,
        mode: 'payment',
        metadata: {
          skus: input.skus,
        },
        success_url: `${
          process.env.VERCEL_URL || process.env.SITE_URL
        }success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.VERCEL_URL || process.env.SITE_URL}cancel`,
      }
      if (input.items.length > 0) {
        options.line_items = input.items
      }

      const session = await stripe.checkout.sessions.create(options)

      return session
    },
  })
