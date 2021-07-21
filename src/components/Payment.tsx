import { zodResolver } from '@hookform/resolvers/zod'
import { useStripe } from '@stripe/react-stripe-js'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import getSKUs from '~lib/crystallize/getSKUs'
import { AddressType } from '~lib/crystallize/types-orders'
import normalizeItems from '~lib/stripe/normalizeItems'
import { trpc } from '~lib/trpc'
import useCart from '~stores/useCart'

import IfElse from './IfElse'

export default function Payment() {
  const customer = useCart((state) => state.customer)
  const updateCustomer = useCart((state) => state.updateCustomer)
  const items = useCart((state) => state.items)
  const { mutate } = trpc.useMutation('stripe.create-checkout-session')
  const stripe = useStripe()

  const schema = z.object({
    email: z.string().email(),
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit((data) => {
    if (Object.keys(errors).length !== 0) return

    updateCustomer({
      addresses: [
        {
          type: AddressType.Billing,
          email: data.email,
        },
      ],
    })

    mutate(
      {
        email: data.email,
        items: normalizeItems(items),
        skus: getSKUs(items),
      },
      {
        onSuccess: (session) => {
          if (stripe && session) {
            stripe.redirectToCheckout({ sessionId: session.id })
          }
        },
      },
    )
  })

  return (
    <div className="space-y-2">
      <div className="pb-1 text-xs border-b font-semibold border-color-500">
        {'Customer'}
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset className="space-y-2">
          <label htmlFor={'email'} className="block text-xs">
            Email
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('email')}
            name="email"
            type="email"
            defaultValue={
              customer?.addresses?.find((a) => a.type === AddressType.Billing)
                ?.email ?? ''
            }
            placeholder="sam.smith@example.com"
            autoComplete="email"
            required
          />
        </fieldset>
        <IfElse predicate={errors.email}>
          {({ message }) => (
            <div className="text-xs text-red-600">{message}</div>
          )}
        </IfElse>
        <button
          type="submit"
          className="uppercase cursor-pointer focus:outline-none"
        >
          [checkout]
        </button>
      </form>
    </div>
  )
}
