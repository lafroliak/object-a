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

function CustomerForm() {
  const customer = useCart((state) => state.customer)
  const updateCustomer = useCart((state) => state.updateCustomer)

  const schema = z.object({
    email: z.string().email(),
    firstName: z.string(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
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
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
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
          phone: data.phone,
        },
      ],
    })
  })

  return (
    <>
      <div className="pb-1 text-xs font-semibold border-b border-color-500">
        {'Customer'}
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
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
        <fieldset className="space-y-2">
          <label htmlFor={'phone'} className="block text-xs">
            Phone Number <small className="italic">optional</small>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('phone')}
            name="phone"
            type="tel"
            defaultValue={
              customer?.addresses?.find((a) => a.type === AddressType.Delivery)
                ?.phone ?? ''
            }
            placeholder="+1 222 333 444444"
            autoComplete="tel"
          />
        </fieldset>
        <button
          type="submit"
          className="uppercase cursor-pointer focus:outline-none"
        >
          [next]
        </button>
      </form>
    </>
  )
}

function AddressForm() {
  const customer = useCart((state) => state.customer)
  const updateCustomer = useCart((state) => state.updateCustomer)
  const items = useCart((state) => state.items)
  const { mutate: validateAddress } = trpc.useMutation('shippo.validateAddress')
  const { mutate: createCustomDeclaration } = trpc.useMutation(
    'shippo.createCustomDeclaration',
  )
  const { mutate: createShipment } = trpc.useMutation('shippo.createShipment')
  const { data: addressFrom } = trpc.useQuery(['shippo.getAddressFrom'])
  const { data } = trpc.useQuery(['geo.getLocation'])

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
    if (Object.keys(errors).length !== 0 || !addressFrom) return

    validateAddress(
      {
        name: `${customer?.firstName || ''}${
          customer?.middleName ? ` ${customer?.middleName}` : ''
        }${customer?.lastName ? ` ${customer?.lastName}` : ''}`,
        country: data.country,
        street1: data.street,
        street2: data.street2,
        city: data.city,
        state: data.state,
        zip: data.postalCode,
      },
      {
        onSuccess: (res) => {
          updateCustomer({
            addresses: [
              {
                type: AddressType.Delivery,
                country: data.country,
                street: data.street,
                street2: data.street2,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
              },
            ],
          })

          if (res.is_complete) {
            if (data.country !== 'US') {
              createCustomDeclaration(
                items.map((item) => ({
                  name: item.name || 'Dress',
                  amount: (
                    item.variants?.[0].priceVariants?.[0].price || 1
                  ).toString(),
                })),
                {
                  onSuccess: (result) => {
                    if (result.object_state === 'VALID') {
                      createShipment(
                        {
                          address_from: {
                            name: addressFrom.name || '',
                            company: addressFrom.company || '',
                            phone: addressFrom.phone || '',
                            country: addressFrom.country || '',
                            street1: addressFrom.street1,
                            street2: addressFrom.street2,
                            city: addressFrom.city || '',
                            state: addressFrom.state || '',
                            zip: addressFrom.zip || '',
                          },
                          address_to: {
                            name: `${customer?.firstName || ''}${
                              customer?.middleName
                                ? ` ${customer?.middleName}`
                                : ''
                            }${
                              customer?.lastName ? ` ${customer?.lastName}` : ''
                            }`,
                            phone:
                              customer?.addresses?.find(
                                (a) => a.type === AddressType.Delivery,
                              )?.phone || '',
                            country: data.country,
                            street1: data.street,
                            street2: data.street2,
                            city: data.city,
                            state: data.state,
                            zip: data.postalCode,
                          },
                          customs_declaration: result.object_id,
                          parcels: [
                            {
                              length: '13',
                              width: '11',
                              height: '2',
                              distance_unit: 'in',
                              weight: '3',
                              mass_unit: 'lb',
                            },
                          ],
                          async: false,
                        },
                        {
                          onSuccess: (res) => {
                            console.log(res)
                          },
                        },
                      )
                    }
                  },
                },
              )
            } else {
              createShipment(
                {
                  address_from: {
                    name: addressFrom.name || '',
                    company: addressFrom.company || '',
                    phone: addressFrom.phone || '',
                    country: addressFrom.country || '',
                    street1: addressFrom.street1,
                    street2: addressFrom.street2,
                    city: addressFrom.city || '',
                    state: addressFrom.state || '',
                    zip: addressFrom.zip || '',
                  },
                  address_to: {
                    name: `${customer?.firstName || ''}${
                      customer?.middleName ? ` ${customer?.middleName}` : ''
                    }${customer?.lastName ? ` ${customer?.lastName}` : ''}`,
                    phone:
                      customer?.addresses?.find(
                        (a) => a.type === AddressType.Delivery,
                      )?.phone || '',
                    country: data.country,
                    street1: data.street,
                    street2: data.street2,
                    city: data.city,
                    state: data.state,
                    zip: data.postalCode,
                  },
                  parcels: [
                    {
                      length: '13',
                      width: '11',
                      height: '2',
                      distance_unit: 'in',
                      weight: '3',
                      mass_unit: 'lb',
                    },
                  ],
                  async: false,
                },
                {
                  onSuccess: (res) => {
                    console.log(res)
                  },
                },
              )
            }
          }
        },
      },
    )
  })

  return (
    <>
      <div className="pb-1 text-xs font-semibold border-b border-color-500">
        {'Address'}
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
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
            defaultValue={
              allowedCountriesList.find(
                (country) => selectedCountry === country.value,
              )?.value
            }
            multiple={false}
            onChange={(e) => selectCountry(e.target.value)}
            required
          >
            {allowedCountriesList.map((country) => (
              <option key={country.value} value={country.value}>
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
        <IfElse predicate={errors.city}>
          {({ message }) => (
            <div className="text-xs text-red-600">{message}</div>
          )}
        </IfElse>
        <button
          type="submit"
          className="uppercase cursor-pointer focus:outline-none"
        >
          [next]
        </button>
      </form>
    </>
  )
}

export default function Payment() {
  const customer = useCart((state) => state.customer)
  const items = useCart((state) => state.items)
  const { mutate } = trpc.useMutation('stripe.create-checkout-session')
  const stripe = useStripe()

  console.log(customer)

  const onSubmit = () => {
    const email =
      customer?.addresses?.find(
        (address) => address.type === AddressType.Billing,
      )?.email || ''

    mutate(
      {
        email,
        items: normalizeItems(items),
        skus: getSKUs(items),
        shipping: undefined,
      },
      {
        onSuccess: (session) => {
          if (stripe && session) {
            stripe.redirectToCheckout({ sessionId: session.id })
          }
        },
      },
    )
  }

  return (
    <div className="space-y-2">
      <CustomerForm />
      <AddressForm />
      <form onSubmit={onSubmit} className="space-y-4">
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
