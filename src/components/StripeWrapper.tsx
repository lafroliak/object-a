import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import getConfig from 'next/config'
import { PropsWithChildren, useState } from 'react'
import { useAsync } from 'react-use'

const { publicRuntimeConfig } = getConfig()

export default function StripeWrapper({
  children,
}: PropsWithChildren<unknown>) {
  const [stripeLoader, setStripeLoader] = useState<Stripe | null>(null)

  useAsync(async () => {
    if (!stripeLoader) {
      const stripe = await loadStripe(
        publicRuntimeConfig.STRIPE_PUBLISHABLE_KEY,
      )
      setStripeLoader(stripe)
    }
  }, [stripeLoader])

  return <Elements stripe={stripeLoader}>{children}</Elements>
}
