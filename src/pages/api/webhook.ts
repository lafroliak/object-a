import { buffer } from 'micro'
import Cors from 'micro-cors'
import type { NextApiRequest, NextApiResponse } from 'next'
import Shippo from 'shippo'
import Stripe from 'stripe'
import { simplyFetchFromGraph } from '~lib/crystallize/graph'
import normaliseOrderModel from '~lib/crystallize/normaliseOrderModel'
import { createCrystallizeOrder } from '~lib/crystallize/order'
import { Product } from '~lib/crystallize/types'
import { Mutation } from '~lib/crystallize/types-orders'
import { createTransaction, getShipment } from '~lib/shippo/api'
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
      try {
        const session = event.data.object as Stripe.Checkout.Session

        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
        )

        if (lineItems) {
          // Fulfill the purchase...
          const products: Product[] = []
          for (let item of lineItems.data) {
            const { data: productData } = await simplyFetchFromGraph({
              query: /* GraphQL */ `
                query PRODUCT(
                  $language: String!
                  $path: String!
                  $version: VersionLabel!
                ) {
                  catalogue(
                    path: $path
                    language: $language
                    version: $version
                  ) {
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
                path: `/${item.description.toLowerCase().split(' ').join('-')}`,
                version: 'published',
              },
            })

            if (productData.catalogue) {
              products.push(productData.catalogue as Product)
            }
          }

          const skus = session.metadata?.skus.split(',') || []
          const cart = products.map((product) => ({
            ...product,
            variants: product.variants?.filter((v) => skus.includes(v.sku)),
          }))

          // Get payment intent object
          if (typeof session.payment_intent === 'string') {
            let transaction: Shippo.Transaction = {} as Shippo.Transaction

            try {
              if (session.shipping?.tracking_number) {
                transaction = await createTransaction({
                  rate: session.shipping.tracking_number,
                  // shipment: res.shipment,
                  // carrier_account: res.shipment.rates[0]?.carrier_account || '',
                  // servicelevel_token:
                  //   res.shipment.rates[0]?.servicelevel.token || '',
                  label_file_type: 'pdf',
                  async: true,
                })
              }
            } catch (err) {
              console.error(err)
            }

            const { charges } = await stripe.paymentIntents.retrieve(
              session.payment_intent,
            )
            const charge = charges?.data?.[0]
            const normalizedInput = normaliseOrderModel({
              cart,
              charge,
              additionalInformation: transaction?.object_id || '',
              meta: [
                {
                  key: 'transaction_id',
                  value: transaction?.object_id || '',
                },
              ],
            })

            const { data: orders } = await createCrystallizeOrder(
              normalizedInput,
            )
            console.log(
              '✅ Order created successfully:',
              (orders as Mutation).orders.create.id,
            )
          }
        }
      } catch (err) {
        return res.status(400).send(`Fulfillment Error: ${err.message}`)
      }
    }

    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

export default cors(webhookHandler as any)
