import * as z from 'zod'
import merge from '~lib/merge'
import {
  createCustomDeclaration,
  createShipment,
  createTransaction,
  getAddress,
  getAddressList,
  getRate,
  getShipment,
  getTransaction,
  validateAddress,
} from '~lib/shippo/api'
import { createRouter } from '~pages/api/trpc/[trpc]'

const address = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  street1: z.string(),
  street2: z.string().optional(),
  street3: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  validation_results: z
    .object({
      is_valid: z.boolean().optional(),
      messages: z.array(z.object({ text: z.string() })).optional(),
    })
    .optional(),
})

const customsItemRequest = z.object({
  description: z.string(),
  mass_unit: z.union([
    z.literal('g'),
    z.literal('oz'),
    z.literal('lb'),
    z.literal('kg'),
  ]),
  net_weight: z.string(),
  origin_country: z.string(),
  quantity: z.number(),
  value_amount: z.string(),
  value_currency: z.string(),
})

const customsDeclarationRequest = z.object({
  certify: z.boolean(),
  certify_signer: z.string(),
  contents_explanation: z.string().optional(),
  contents_type: z.union([
    z.literal('DOCUMENTS'),
    z.literal('GIFT'),
    z.literal('SAMPLE'),
    z.literal('MERCHANDISE'),
    z.literal('HUMANITARIAN_DONATION'),
    z.literal('RETURN_MERCHANDISE'),
    z.literal('OTHER'),
  ]),
  eel_pfc: z
    .union([
      z.literal('NOEEI_30_37_a'),
      z.literal('NOEEI_30_37_h'),
      z.literal('NOEEI_30_36'),
      z.literal('AES_ITN'),
    ])
    .optional(),
  incoterm: z.union([z.literal('DDP'), z.literal('DDU')]).optional(),
  items: z.array(customsItemRequest),
  non_delivery_option: z.union([z.literal('ABANDON'), z.literal('RETURN')]),
})

const parcel = z.object({
  distance_unit: z.union([
    z.literal('cm'),
    z.literal('in'),
    z.literal('ft'),
    z.literal('mm'),
    z.literal('m'),
    z.literal('yd'),
  ]),
  height: z.string(),
  length: z.string(),
  mass_unit: z.union([
    z.literal('g'),
    z.literal('oz'),
    z.literal('lb'),
    z.literal('kg'),
  ]),
  weight: z.string(),
  width: z.string(),
})

const addressRequest = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  street1: z.string(),
  street2: z.string().optional(),
  street3: z.string().optional(),
  city: z.string(),
  zip: z.string(),
  state: z.string(),
  country: z.string(),
})

const shipmentRequest = z.object({
  address_from: address,
  address_to: address,
  async: z.boolean().optional().default(false),
  customs_declaration: z
    .union([z.string(), customsDeclarationRequest])
    .optional(),
  parcels: z.union([z.string(), parcel, z.array(parcel)]),
})

const transactionRequest = z.object({
  shipment: shipmentRequest,
  servicelevel_token: z.string(),
  carrier_account: z.string(),
  label_file_type: z.union([z.literal('png'), z.literal('pdf')]),
})

export const shippoRouter = createRouter()
  .query('getAddressList', {
    async resolve({ ctx, input }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const addressList = await getAddressList()

      return addressList
    },
  })
  .query('getAddressFrom', {
    async resolve({ ctx }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const addressFrom = await getAddress(process.env.SHIPPO_ADDRESS_FROM!)

      return addressFrom
    },
  })
  .mutation('validateAddress', {
    input: addressRequest,
    async resolve({ input }) {
      const validatedAddress = await validateAddress({
        name: input.name || '',
        street1: input.street1,
        street2: input.street2,
        street3: input.street3,
        city: input.city,
        zip: input.zip,
        state: input.state,
        country: input.country,
        async: false,
        validate: true,
      })

      return validatedAddress
    },
  })
  .mutation('createCustomDeclaration', {
    input: z.object({
      items: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        }),
      ),
      country: z.string(),
    }),
    async resolve({ input }) {
      const createdShipment = await createCustomDeclaration(
        input.items.map(
          (item) =>
            ({
              description: item.name,
              quantity: 1,
              net_weight: '1',
              mass_unit: 'lb',
              value_amount: item.amount,
              value_currency: 'USD',
              origin_country: 'US',
              eel_pfc: input.country === 'ca' ? 'NOEEI_30_36' : 'NOEEI_30_37_a',
              incoterm: 'DDU',
            } as Shippo.CreateCustomsItemRequest),
        ),
      )

      return createdShipment
    },
  })
  .mutation('createShipment', {
    input: shipmentRequest,
    async resolve({ input }) {
      const createdShipment = await createShipment(input)

      return createdShipment
    },
  })
  .query('getRate', {
    input: z.string(),
    async resolve({ ctx, input }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const shipment = await getRate(input)

      return shipment
    },
  })
  .query('getShipment', {
    input: z.string(),
    async resolve({ ctx, input }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const shipment = await getShipment(input)

      return shipment
    },
  })
  // .mutation('createTransactionByRate', {
  //   input: z.string(),
  //   async resolve({ input }) {
  //     const createdTransaction = await createTransaction({
  //       rate: input,
  //       label_file_type: 'pdf',
  //       async: false,
  //     })

  //     return createdTransaction
  //   },
  // })
  .mutation('createTransaction', {
    input: transactionRequest,
    async resolve({ ctx, input }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const createdTransaction = await createTransaction(
        merge(input, {
          shipment: {
            custom_declaration:
              typeof input.shipment.customs_declaration === 'object' &&
              merge(input.shipment.customs_declaration, {
                eel_pfc:
                  input.shipment.address_to.country === 'ca'
                    ? 'NOEEI_30_36'
                    : 'NOEEI_30_37_a',
                incoterm: 'DDU',
              }),
          },
        }),
      )

      return createdTransaction
    },
  })
  .query('getTransaction', {
    input: z.string(),
    async resolve({ ctx, input }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const transaction = await getTransaction(input)

      return transaction
    },
  })
