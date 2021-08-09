import Stripe from 'stripe'

import { Product } from './types'
import { AddressType, CreateOrderInput, PaymentProvider } from './types-orders'

type Props = {
  cart: Product[]
  charge: Stripe.Charge
  [key: string]: any
}

export default function normaliseOrderModel({
  cart,
  charge,
  ...rest
}: Props): CreateOrderInput {
  const customerName = (charge.billing_details?.name ?? '').split(' ')
  const email = charge.receipt_email || charge.billing_details.email

  return {
    additionalInformation: '',
    payment: [
      {
        provider: PaymentProvider.Stripe,
        stripe: {
          customerId: String(charge.customer),
          orderId: String(charge.payment_intent),
          paymentMethod: charge.payment_method_details?.type,
          paymentMethodId: charge.payment_method,
          paymentIntentId: String(charge.payment_intent),
          metadata: '',
        },
      },
    ],
    total: {
      gross: (charge.amount ?? 100) / 100,
      currency: 'USD',
    },
    ...(cart && {
      cart: cart.map(function handleOrderCartItem(item) {
        return {
          name: item.name ?? '',
          sku: item.variants?.[0].sku,
          productId: item.id,
          productVariantId: item.variants?.[0].id,
          quantity: 1,
          price: {
            gross: item.variants?.[0].priceVariants?.[0].price || 1,
            net: item.variants?.[0].priceVariants?.[0].price || 1,
            tax: item.vatType,
            currency: 'USD',
          },
          imageUrl: item.variants?.[0].images?.[0].url,
        }
      }),
    }),
    customer: {
      firstName: customerName[0],
      middleName: customerName.slice(1, customerName.length - 1).join(),
      lastName: customerName[customerName.length - 1],
      birthDate: Date,
      ...(charge.shipping &&
        charge.billing_details && {
          addresses: [
            {
              type: AddressType.Billing,
              firstName: customerName[0],
              middleName: customerName.slice(1, customerName.length - 1).join(),
              lastName: customerName[customerName.length - 1],
              street: charge.billing_details.address?.line1,
              street2: charge.billing_details.address?.line2,
              postalCode: charge.billing_details.address?.postal_code,
              city: charge.billing_details.address?.city,
              state: charge.billing_details.address?.state,
              country: charge.billing_details.address?.country,
              email,
            },
            {
              type: AddressType.Delivery,
              firstName: customerName[0],
              middleName: customerName.slice(1, customerName.length - 1).join(),
              lastName: customerName[customerName.length - 1],
              street: charge.shipping.address?.line1,
              street2: charge.shipping.address?.line2,
              postalCode: charge.shipping.address?.postal_code,
              city: charge.shipping.address?.city,
              state: charge.shipping.address?.state,
              country: charge.shipping.address?.country,
              email,
            },
          ],
        }),
    },
    ...rest,
  }
}
