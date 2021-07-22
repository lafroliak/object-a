import { zodResolver } from '@hookform/resolvers/zod'
import { useStripe } from '@stripe/react-stripe-js'
import { useEffect } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { allowedCountriesList } from '~lib/countryList'

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
  // const { mutate } = trpc.useMutation('shippo.validateAddress')
  // const { mutate } = trpc.useMutation('shippo.createShipment')
  const { data } = trpc.useQuery(['geo.getLocation'])
  // const { data: addressList } = trpc.useQuery(['shippo.getAddressList'])
  const stripe = useStripe()

  // console.log(addressList)

  const [selectedCountry, selectCountry] = useState<
    typeof allowedCountriesList[number]['value'] | null
  >(null)

  useEffect(() => {
    selectCountry(
      allowedCountriesList.find((country) =>
        customer?.addresses?.find(
          (a) => a.type === AddressType.Delivery && country.value === a.country,
        ),
      )?.value ||
        data?.country_code ||
        null,
    )
  }, [customer?.addresses, data?.country_code])

  const schema = z.object({
    email: z.string().email(),
    firstName: z.string(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    country: z.string(),
    street: z.string(),
    street2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
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
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          country: data.country,
          street: data.street,
          street2: data.street2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
        },
      ],
    })

    // mutate(
    //   {
    //     address_from: {},
    //     address_to: {
    //       name: `${data.firstName}${
    //         data.middleName ? ` ${data.middleName}` : ''
    //       }${data.lastName ? ` ${data.lastName}` : ''}`,
    //       country: data.country,
    //       street1: data.street,
    //       street2: data.street2,
    //       city: data.city,
    //       state: data.state,
    //       zip: data.postalCode,
    //     },
    //   },
    //   {
    //     onSuccess: (res) => {
    //       console.log(res)
    //     },
    //   },
    // )
    // mutate(
    //   {
    //     name: `${data.firstName}${
    //       data.middleName ? ` ${data.middleName}` : ''
    //     }${data.lastName ? ` ${data.lastName}` : ''}`,
    //     country: data.country,
    //     street1: data.street,
    //     street2: data.street2,
    //     city: data.city,
    //     state: data.state,
    //     zip: data.postalCode,
    //   },
    //   {
    //     onSuccess: (res) => {
    //       console.log(res)
    //     },
    //   },
    // )
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
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="pb-1 text-xs font-semibold border-b border-color-500">
          {'Customer'}
        </div>
        <fieldset className="space-y-2">
          <label htmlFor={'email'} className="block text-xs">
            Email <small className="italic">required</small>
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
        <fieldset className="space-y-2">
          <label htmlFor={'firstName'} className="block text-xs">
            First Name <small className="italic">required</small>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('firstName')}
            name="firstName"
            type="text"
            defaultValue={customer?.firstName ?? ''}
            placeholder="Sam"
            autoComplete="given-name"
            required
          />
        </fieldset>
        <fieldset className="space-y-2">
          <label htmlFor={'middleName'} className="block text-xs">
            Middle Name <small className="italic">optional</small>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('middleName')}
            name="middleName"
            type="text"
            defaultValue={customer?.middleName ?? ''}
            placeholder="Smith"
            autoComplete="additional-name"
          />
        </fieldset>
        <fieldset className="space-y-2">
          <label htmlFor={'lastName'} className="block text-xs">
            Last Name <small className="italic">optional</small>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('lastName')}
            name="lastName"
            type="text"
            defaultValue={customer?.lastName ?? ''}
            placeholder="Smith"
            autoComplete="family-name"
          />
        </fieldset>
        <div className="pb-1 text-xs font-semibold border-b border-color-500">
          {'Address'}
        </div>
        <fieldset className="space-y-2">
          <label htmlFor={'country'} className="block text-xs">
            Country <small className="italic">required</small>
          </label>
          <select
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('country')}
            name="country1"
            placeholder="Country"
            autoComplete="country"
            multiple={false}
            onChange={(e) => selectCountry(e.target.value)}
            required
          >
            {allowedCountriesList.map((country) => (
              <option
                key={country.value}
                value={country.value}
                selected={selectedCountry === country.value}
              >
                {country.text}
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset className="space-y-2">
          <label htmlFor={'street'} className="block text-xs">
            Street 1 <small className="italic">required</small>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('street')}
            name="street"
            type="text"
            defaultValue={
              customer?.addresses?.find((a) => a.type === AddressType.Delivery)
                ?.street ?? ''
            }
            placeholder="Street 1"
            autoComplete="address-line1"
            required
          />
        </fieldset>
        <fieldset className="space-y-2">
          <label htmlFor={'street2'} className="block text-xs">
            Street 2 <small className="italic">optional</small>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('street2')}
            name="street2"
            type="text"
            defaultValue={
              customer?.addresses?.find((a) => a.type === AddressType.Delivery)
                ?.street2 ?? ''
            }
            placeholder="Street 2"
            autoComplete="address-line2"
          />
        </fieldset>
        <fieldset className="space-y-2">
          <label htmlFor={'city'} className="block text-xs">
            City <small className="italic">required</small>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('city')}
            name="city"
            type="text"
            defaultValue={
              customer?.addresses?.find((a) => a.type === AddressType.Delivery)
                ?.city ||
              data?.city ||
              ''
            }
            placeholder="City"
            autoComplete="address-level2"
            required
          />
        </fieldset>
        <fieldset className="space-y-2">
          <label htmlFor={'state'} className="block text-xs">
            State <small className="italic">required</small>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('state')}
            name="state"
            type="text"
            defaultValue={
              customer?.addresses?.find((a) => a.type === AddressType.Delivery)
                ?.state ||
              data?.state ||
              ''
            }
            placeholder="State"
            autoComplete="address-level1"
            required
          />
        </fieldset>
        <fieldset className="space-y-2">
          <label htmlFor={'postalCode'} className="block text-xs">
            Postal Code (ZIP) <small className="italic">required</small>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('postalCode')}
            name="postalCode"
            type="text"
            defaultValue={
              customer?.addresses?.find((a) => a.type === AddressType.Delivery)
                ?.postalCode ||
              data?.postal ||
              ''
            }
            placeholder="PostalCode"
            autoComplete="postal-code"
            required
          />
        </fieldset>
        <div className="pb-1 text-xs font-semibold border-b border-color-500">
          {'Card'}
        </div>
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
