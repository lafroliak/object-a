import { PaymentMethodCreateParams } from '@stripe/stripe-js'

import { Address } from '~lib/crystallize/types-orders'
import { Option } from '~typings/utils'

export default function normalizeAddress(
  input: Option<Address>,
): PaymentMethodCreateParams.BillingDetails.Address | undefined {
  return input
    ? {
        city: input.city || '',
        country: input.country || '',
        line1: input.street || '',
        line2: input.street2 || '',
        postal_code: input.postalCode || '',
        state: input.state || '',
      }
    : undefined
}
