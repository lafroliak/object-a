import { zodResolver } from '@hookform/resolvers/zod'
import { useStripe } from '@stripe/react-stripe-js'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { allowedCountriesList } from '~lib/countryList'
import getSKUs from '~lib/crystallize/getSKUs'
import { VersionLabel } from '~lib/crystallize/types'
import { AddressType } from '~lib/crystallize/types-orders'
import normalizeItems from '~lib/stripe/normalizeItems'
import { trpc } from '~lib/trpc'
import useCart from '~stores/useCart'
import IfElse from './IfElse'

export default function Payment() {
  const customer = useCart((state) => state.customer)
  const updateCustomer = useCart((st) => st.updateCustomer)
  const items = useCart((state) => state.items)
  const totals = useCart((state) => state.totals())
  const { mutate } = trpc.useMutation('stripe.create-checkout-session')
  const { mutate: subscribe } = trpc.useMutation('mailchimp.subscribe')
  const { data: geoLocation } = trpc.useQuery(['geo.getLocation'])
  const stripe = useStripe()

  const [selectedCountry, selectCountry] = useState<
    typeof allowedCountriesList[number]['value'] | undefined
  >(undefined)

  useEffect(() => {
    selectCountry(
      allowedCountriesList.find((country) =>
        customer?.addresses?.find(
          (a) => a.type === AddressType.Delivery && country.value === a.country,
        ),
      )?.value ||
        geoLocation?.country_code ||
        undefined,
    )
  }, [customer?.addresses, geoLocation?.country_code])

  const handleSelectCountry = (e: any) => {
    selectCountry(e.target.value)
  }

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
        {
          type: AddressType.Delivery,
          email: data.email,
          country: selectedCountry,
        },
      ],
    })

    subscribe(data.email)

    mutate(
      {
        email: data.email,
        items: normalizeItems(items),
        skus: getSKUs(items),
        country: selectedCountry,
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
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="pb-1 text-xs font-semibold border-b border-red-500/50">
          {'Customer'}
        </div>
        <fieldset className="space-y-2">
          <label htmlFor={'email'} className="block text-xs">
            Email{' '}
            <IfElse
              predicate={errors.email}
              placeholder={<small className="italic">required</small>}
            >
              {({ message }) => (
                <small className="text-xs text-red-600">{message}</small>
              )}
            </IfElse>
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
        <div className="pt-4 pb-1 text-xs font-semibold border-b border-red-500/50">
          {'Shipping'}
        </div>
        <fieldset className="space-y-2">
          <label htmlFor={'country'} className="block text-xs">
            Country <small className="italic">required</small>
          </label>
          <select
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            name="country"
            placeholder="Country"
            autoComplete="country"
            value={selectedCountry}
            multiple={false}
            onChange={handleSelectCountry}
            required
          >
            {allowedCountriesList.map((country) => (
              <option key={country.value} value={country.value}>
                {country.text}
              </option>
            ))}
          </select>
        </fieldset>
        <div className="pt-6 pb-1 text-xs font-semibold border-b border-red-500/50">
          {'Total'}
        </div>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={`payment-${item.id}-${idx}`}>
              [{item.name?.trim()}]{' '}
              {item.variants?.[0].attributes?.[0]?.value?.toUpperCase() || ''} —
              ${item.variants?.[0]?.priceVariants?.[0]?.price ?? 0}
            </li>
          ))}
          <li>
            Shipping: <strong>${selectedCountry === 'US' ? 6 : 12}</strong>
          </li>
        </ul>
        <div>
          Total:{' '}
          <strong>${totals.net + (selectedCountry === 'US' ? 6 : 12)}</strong>
        </div>
        <div className="pt-6 space-x-4">
          <button
            type="submit"
            className="text-lg uppercase md:transition-colors md:ease-in-out md:delay-100 md:text-color-900/0 md:dark:text-color-100/0 md:bg-clip-text md:bg-gradient-to-r md:from-color-900 md:dark:from-color-100 md:hover:from-rose-500 md:to-color-900 md:dark:to-color-100 md:hover:to-cyan-500"
          >
            [checkout]
          </button>
        </div>
      </form>
      <div className="pt-6">
        If you have any questions, please email{' '}
        <a href="mailto:lafroliak@gmail.com">lafroliak@gmail.com</a>
      </div>
    </>
  )
}
