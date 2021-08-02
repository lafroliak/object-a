import Stripe from 'stripe'
import * as z from 'zod'
import allowedCountries from '~lib/stripe/allowedCountries'
import { stripe } from '~lib/stripe/createClient'
import { createRouter } from '~pages/api/trpc/[trpc]'

const address = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
})

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
      shipping: z
        .object({
          name: z.string(),
          carrier: z.string().optional(),
          phone: z.string().optional(),
          tracking_number: z.string().optional(),
          address,
        })
        .optional(),
    }),
    async resolve({ input }) {
      const options: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        // shipping_rates: [process.env.SHIPPING_RATE!], // NOPE!
        billing_address_collection: 'auto',
        shipping_address_collection: {
          allowed_countries: allowedCountries,
        },
        customer_email: input.email,
        mode: 'payment',
        metadata: {
          skus: input.skus,
        },
        payment_intent_data: {
          receipt_email: input.email,
          shipping: input.shipping,
        },
        success_url: `${process.env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.SITE_URL}/cancel`,
      }
      if (input.items.length > 0) {
        options.line_items = input.items
      }

      const session = await stripe.checkout.sessions.create(options)

      return session
    },
  })
