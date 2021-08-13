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

type Props = {
  state: State
  next: () => void
  rates?: Shippo.Rate[]
  shipmentID?: string
}

function CustomerForm({ state, next }: Props) {
  const customer = useCart((st) => st.customer)
  const updateCustomer = useCart((st) => st.updateCustomer)

  const schema = z.object({
    email: z.string().email(),
    fullName: z.string(),
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
    const name = data.fullName.split(' ')

    updateCustomer({
      firstName: name[0],
      middleName: name.slice(1, name.length - 1).join(),
      lastName: name[name.length - 1],
      addresses: [
        {
          type: AddressType.Billing,
          email: data.email,
        },
        {
          type: AddressType.Delivery,
          email: data.email,
          firstName: name[0],
          middleName: name.slice(1, name.length - 1).join(),
          lastName: name[name.length - 1],
          phone: data.phone,
        },
      ],
    })

    next()
  })

  return (
    <>
      <div className="pb-1 text-xs font-semibold border-b border-color-500">
        {'Customer'}
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
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
        <fieldset className="space-y-2">
          <label htmlFor={'fullName'} className="block text-xs">
            Full Name{' '}
            <IfElse
              predicate={errors.fullName}
              placeholder={<small className="italic">required</small>}
            >
              {({ message }) => (
                <small className="text-xs text-red-600">{message}</small>
              )}
            </IfElse>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('fullName')}
            name="fullName"
            type="text"
            defaultValue={`${customer?.firstName || ''}${
              customer?.middleName ? ` ${customer?.middleName}` : ''
            }${customer?.lastName ? ` ${customer?.lastName}` : ''}`}
            placeholder="Sam Smith"
            autoComplete="name"
            required
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
        <IfElse predicate={state === STATES[1]}>
          {() => (
            <button
              type="submit"
              className="uppercase cursor-pointer focus:outline-none"
            >
              [next]
            </button>
          )}
        </IfElse>
      </form>
    </>
  )
}

function AddressForm({ state, next }: Props) {
  const customer = useCart((st) => st.customer)
  const updateCustomer = useCart((st) => st.updateCustomer)
  const items = useCart((st) => st.items)
  const { data: geoLocation } = trpc.useQuery(['geo.getLocation'])
  const { data: addressFrom } = trpc.useQuery(['shippo.getAddressFrom'])
  const { mutate: validateAddress, isLoading: validateAddressLoading } =
    trpc.useMutation('shippo.validateAddress')
  const {
    mutate: createCustomDeclaration,
    isLoading: createCustomDeclarationLoading,
  } = trpc.useMutation('shippo.createCustomDeclaration')
  const { mutate: createShipment, isLoading: createShipmentLoading } =
    trpc.useMutation('shippo.createShipment')
  const isLoading =
    validateAddressLoading ||
    createCustomDeclarationLoading ||
    createShipmentLoading
  const [selectedCountry, selectCountry] = useState<
    typeof allowedCountriesList[number]['value'] | undefined
  >(undefined)
  const [messages, setMessages] = useState<Shippo.Message[]>([])
  const [rates, setRates] = useState<Shippo.Rate[]>([])
  const [shipmentID, setShipmentID] = useState<string>('')

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

  const schema = z.object({
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
    setMessages([])

    updateCustomer({
      addresses: [
        {
          type: AddressType.Delivery,
          country: selectedCountry,
          street: data.street,
          street2: data.street2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
        },
      ],
    })

    validateAddress(
      {
        name: `${customer?.firstName || ''}${
          customer?.middleName ? ` ${customer?.middleName}` : ''
        }${customer?.lastName ? ` ${customer?.lastName}` : ''}`,
        country: selectedCountry || 'US',
        street1: data.street,
        street2: data.street2,
        city: data.city,
        state: data.state,
        zip: data.postalCode,
      },
      {
        onError: () => {
          setMessages([{ text: 'HARD: Some error has occured. Please, retry' }])
        },
        onSuccess: (res) => {
          if (
            !res.test &&
            res.validation_results?.is_valid === false &&
            res.validation_results?.messages
          ) {
            setMessages(res.validation_results.messages)
            return
          }

          if (res.is_complete) {
            if (selectedCountry !== 'US') {
              createCustomDeclaration(
                {
                  items: items
                    .filter(
                      (item) => !item.name?.toLowerCase()?.includes('shipping'),
                    )
                    .map((item) => ({
                      name: item.name || 'Dress',
                      amount: (
                        item.variants?.[0].priceVariants?.[0].price || 1
                      ).toString(),
                    })),
                  country: (selectedCountry || 'US').toLowerCase(),
                },
                {
                  onError: () => {
                    setMessages([
                      { text: 'HARD: Some error has occured. Please, retry' },
                    ])
                  },
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
                            country: selectedCountry || 'US',
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
                              weight: '2',
                              mass_unit: 'lb',
                            },
                          ],
                          async: false,
                        },
                        {
                          onError: () => {
                            setMessages([
                              {
                                text: 'HARD: Some error has occured. Please, retry',
                              },
                            ])
                          },
                          onSuccess: (res) => {
                            if (res.messages) {
                              setMessages(
                                res.messages.reduce<any[]>(
                                  (r, c) =>
                                    !r.some((x) => x.code === c.code)
                                      ? [...r, c]
                                      : r,
                                  [],
                                ),
                              )
                            }
                            if (res.rates.length) {
                              setRates(res.rates)
                              setShipmentID(res.object_id)
                              next()
                            }
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
                    country: selectedCountry || 'US',
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
                      weight: '2',
                      mass_unit: 'lb',
                    },
                  ],
                  async: false,
                },
                {
                  onError: () => {
                    setMessages([
                      { text: 'HARD: Some error has occured. Please, retry' },
                    ])
                  },
                  onSuccess: (res) => {
                    if (res.messages) {
                      setMessages(
                        res.messages.reduce<any[]>(
                          (r, c) =>
                            !r.some((x) => x.code === c.code) ? [...r, c] : r,
                          [],
                        ),
                      )
                    }
                    if (res.rates.length) {
                      setRates(res.rates)
                      setShipmentID(res.object_id)
                      next()
                    }
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
      <div className="pt-4 pb-1 text-xs font-semibold border-b border-color-500">
        {'Shipping'}
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
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
            Address{' '}
            <IfElse
              predicate={errors.street}
              placeholder={<small className="italic">required</small>}
            >
              {({ message }) => (
                <small className="text-xs text-red-600">{message}</small>
              )}
            </IfElse>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('street')}
            placeholder="Address"
            name="street"
            type="text"
            defaultValue={
              customer?.addresses?.find((a) => a.type === AddressType.Delivery)
                ?.street || ''
            }
            autoComplete="address-line1"
            required
          />
        </fieldset>
        <fieldset className="space-y-2">
          <label htmlFor={'street2'} className="block text-xs">
            Address line 2 <small className="italic">optional</small>
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
            placeholder="Address line 2"
            autoComplete="address-line2"
          />
        </fieldset>
        <fieldset className="space-y-2">
          <label htmlFor={'city'} className="block text-xs">
            City{' '}
            <IfElse
              predicate={errors.city}
              placeholder={<small className="italic">required</small>}
            >
              {({ message }) => (
                <small className="text-xs text-red-600">{message}</small>
              )}
            </IfElse>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('city')}
            name="city"
            type="text"
            defaultValue={
              customer?.addresses?.find((a) => a.type === AddressType.Delivery)
                ?.city || ''
            }
            placeholder="City"
            autoComplete="address-level2"
            required
          />
        </fieldset>
        <fieldset className="space-y-2">
          <label htmlFor={'state'} className="block text-xs">
            State{' '}
            <IfElse
              predicate={errors.state}
              placeholder={<small className="italic">required</small>}
            >
              {({ message }) => (
                <small className="text-xs text-red-600">{message}</small>
              )}
            </IfElse>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('state')}
            name="state"
            type="text"
            defaultValue={
              customer?.addresses?.find((a) => a.type === AddressType.Delivery)
                ?.state || ''
            }
            placeholder="State"
            autoComplete="address-level1"
            required
          />
        </fieldset>
        <fieldset className="space-y-2">
          <label htmlFor={'postalCode'} className="block text-xs">
            Postal Code (ZIP){' '}
            <IfElse
              predicate={errors.postalCode}
              placeholder={<small className="italic">required</small>}
            >
              {({ message }) => (
                <small className="text-xs text-red-600">{message}</small>
              )}
            </IfElse>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('postalCode')}
            name="postalCode"
            type="text"
            defaultValue={
              customer?.addresses?.find((a) => a.type === AddressType.Delivery)
                ?.postalCode ||
              geoLocation?.postal ||
              ''
            }
            placeholder="PostalCode"
            autoComplete="postal-code"
            required
          />
        </fieldset>
        <IfElse predicate={messages.length > 0 ? messages : null}>
          {(msgs) => (
            <div className="space-y-2">
              {msgs.map((msg) => (
                <div
                  key={msg.text}
                  className={`text-xs ${
                    msg.text.toLowerCase().includes('hard')
                      ? 'text-red-600'
                      : 'text-orange-600'
                  }`}
                >
                  {msg.source ? <strong>{msg.source || ''} </strong> : null}
                  {msg.text}
                </div>
              ))}
            </div>
          )}
        </IfElse>
        <IfElse predicate={state === STATES[2]}>
          {() => (
            <button
              type="submit"
              className="uppercase cursor-pointer focus:outline-none"
              disabled={isLoading}
            >
              [{isLoading ? 'loading...' : 'next'}]
            </button>
          )}
        </IfElse>
      </form>
      <IfElse predicate={STATES.slice(-2).includes(state) && rates.length}>
        {() => (
          <Shipping
            state={state}
            next={next}
            rates={rates}
            shipmentID={shipmentID}
          />
        )}
      </IfElse>
    </>
  )
}

function Shipping({ state, next, rates }: Props) {
  const [selected, setRate] = useState<Shippo.Rate | null>(null)
  const shipping = useCart((st) =>
    st.items.find((item) => item.name?.toLowerCase()?.includes('shipping')),
  )
  const addItem = useCart((st) => st.addItem)
  const deleteItem = useCart((st) => st.deleteItem)

  const handleClick = (rate: Shippo.Rate) => {
    if (!rate) return

    setRate(rate)

    if (shipping) {
      deleteItem(shipping.id)
    }

    addItem({
      id: rate.object_id,
      name: `SHIPPING by ${rate.provider} ${rate.servicelevel.name}`,
      shape: {
        id: rate.object_id,
      },
      version: {
        id: rate.object_id,
        label: VersionLabel.Draft,
      },
      subtree: {
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false,
          startCursor: 'nope',
          endCursor: 'nope',
          totalNodes: 1,
        },
      },
      variants: [
        {
          id: rate.object_id,
          sku: rate.shipment,
          name: `${rate.provider} ${rate.servicelevel.name}`,
          priceVariants: [
            { price: Number(rate.amount), identifier: rate.object_id },
          ],
        },
      ],
    })

    if (state === STATES[3]) next()
  }

  return (
    <>
      <div className="pt-6 pb-1 text-xs font-semibold border-b border-color-500">
        {'Shipping'}
      </div>
      <ul className="space-y-2">
        {rates?.map((rate) => (
          <li key={rate.object_id}>
            <input
              type="radio"
              className="mr-2"
              checked={selected?.object_id === rate.object_id}
              onChange={() => setRate(rate)}
            />
            <button
              type="button"
              className={`cursor-pointer text-left focus:outline-none${
                selected?.object_id === rate.object_id ? ' underline' : ''
              }`}
              onClick={() => handleClick(rate)}
            >
              <strong>{rate.provider}</strong> {rate.servicelevel.name} — $
              {rate.amount}
            </button>{' '}
            <small className="opacity-75">{rate.duration_terms}</small>
          </li>
        ))}
      </ul>
    </>
  )
}

const STATES = ['idle', 'customer', 'address', 'shipping', 'checkout'] as const

type State = typeof STATES[number]

export default function Payment() {
  const customer = useCart((state) => state.customer)
  const items = useCart((state) => state.items)
  const totals = useCart((state) => state.totals())
  const shipping = useCart((st) =>
    st.items.find((item) => item.name?.toLowerCase()?.includes('shipping')),
  )
  const address = customer?.addresses?.find(
    (a) => a.type === AddressType.Delivery,
  )
  const { mutate } = trpc.useMutation('stripe.create-checkout-session')
  const stripe = useStripe()
  const [state, setState] = useState<number>(0)
  const currentState = STATES[state]
  const next = () => {
    setState((prev) => Math.min(prev + 1, STATES.length - 1))
  }

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
        shipping:
          shipping && address
            ? {
                name: `${customer?.firstName || ''}${
                  customer?.middleName ? ` ${customer?.middleName}` : ''
                }${customer?.lastName ? ` ${customer?.lastName}` : ''}`,
                carrier: 'UPS',
                tracking_number: shipping.id,
                phone: address.phone || '',
                address: {
                  line1: address.street || '',
                  line2: address.street2 || '',
                  city: address.city || '',
                  postal_code: address.postalCode || '',
                  state: address.state || '',
                  country: address.country || '',
                },
              }
            : undefined,
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
      <IfElse predicate={currentState === STATES[0]}>
        {() => (
          <button
            type="button"
            className="uppercase cursor-pointer focus:outline-none"
            onClick={next}
          >
            [buy]
          </button>
        )}
      </IfElse>
      <IfElse predicate={state >= 1}>
        {() => <CustomerForm state={currentState} next={next} />}
      </IfElse>
      <IfElse predicate={state >= 2}>
        {() => <AddressForm state={currentState} next={next} />}
      </IfElse>
      <IfElse predicate={currentState === STATES[4]}>
        {() => (
          <>
            <div className="pt-6 pb-1 text-xs font-semibold border-b border-color-500">
              {'Totals'}
            </div>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  [{item.name}] — $
                  {item.variants?.[0]?.priceVariants?.[0]?.price ?? 0}
                </li>
              ))}
            </ul>
            <div>
              Total: <strong>${totals.net}</strong>
            </div>
            <div className="pt-6 space-x-4">
              <button
                type="button"
                className="uppercase cursor-pointer focus:outline-none"
                onClick={onSubmit}
              >
                [checkout]
              </button>
            </div>
          </>
        )}
      </IfElse>
      <div className="pt-6">
        If you have any questions, please email{' '}
        <a href="mailto:info@objekt-a.shop">info@objekt-a.shop</a>
      </div>
    </div>
  )
}
