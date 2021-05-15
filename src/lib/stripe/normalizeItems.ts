import Stripe from 'stripe'

import { Product } from '~lib/crystallize/types'
import { Option } from '~typings/utils'

export default function normalizeItems(
  items: Option<Array<Product>>,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const res: Stripe.Checkout.SessionCreateParams.LineItem[] = []

  if (!items) return res

  items.forEach((item) => {
    if (!item.name) return

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name.trim(),
          metadata: {
            sku: item.variants?.[0].sku || '',
          },
        },
        unit_amount:
          (item.variants?.[0].priceVariants?.[0].price ?? 0.01) * 100,
      },
      quantity: 1,
    }

    const image = item.variants?.[0].images?.reduce<string | undefined>(
      (res, img) => {
        if (res) return res
        const image = img.variants?.find(
          (im) => im.width === 500 && im.url.includes('png'),
        )?.url
        return image
      },
      undefined,
    )

    if (image) {
      lineItem.price_data!.product_data!.images = [`${image}?cache=true`]
    }
    res.push(lineItem)
  })

  return res
}
