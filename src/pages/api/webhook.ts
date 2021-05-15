import { buffer } from 'micro'
import Cors from 'micro-cors'
import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

import { simplyFetchFromGraph } from '~lib/crystallize/graph'
import { stripe } from '~lib/stripe/createClient'

const endpointSecret = process.env.WEBHOOK_SECRET!

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
}

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req)
    const sig = req.headers['stripe-signature']!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        endpointSecret,
      )
    } catch (err) {
      // On error, log and return the error message.
      console.log(`❌ Error message: ${err.message}`)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Successfully constructed event.
    console.log('✅ Success:', event.id)

    // Handle the checkout.session.completed event
    // if (event.type === 'payment_intent.succeeded') {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Get payment intent object
      // if (typeof session.payment_intent === 'string') {
      //   const { data } = await fetchCrystallizeAllOrders()
      //   const order = (data as Query).orders.getAll.edges?.find(
      //     ({ node }) =>
      //       (node.payment?.[0] as StripePayment).paymentIntentId ===
      //       session.payment_intent,
      //   )
      //   if (!order?.node.id) {
      //     const { charges } = await stripe.paymentIntents.retrieve(
      //       session.payment_intent,
      //     )
      //     const charge = charges?.data?.[0]
      //     console.log(charge)
      //   }
      // }

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          limit: 100,
        },
      )

      if (lineItems) {
        // Fulfill the purchase...
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
            path: `/${lineItems.data[0].description
              .toLowerCase()
              .split(' ')
              .join('-')}`,
            version: 'published',
          },
        })

        // TODO how we now sku here for right order??
        console.log(JSON.stringify(data, null, 2))

        try {
        } catch (err) {
          return res.status(400).send(`Fulfillment Error: ${err.message}`)
        }
      }
    }

    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

export default cors(webhookHandler as any)
