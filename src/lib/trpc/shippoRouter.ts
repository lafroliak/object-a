import * as z from 'zod'

import {
  createShipment,
  createTransaction,
  validateAddress,
} from '~lib/shippo/api'
import { createRouter } from '~pages/api/trpc/[trpc]'

const address = z.object({
  name: z.string(),
  street1: z.string(),
  street2: z.string().optional(),
  street3: z.string().optional(),
  city: z.string(),
  zip: z.string(),
  state: z.string(),
  country: z.string(),
  company: z.string().optional(),
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
  net_weight: z.number(),
  origin_country: z.string(),
  quantity: z.number(),
  value_amount: z.number(),
  value_currency: z.string(),
})

const customsDeclarationRequest = z
  .object({
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
  .optional()

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
  name: z.string(),
  street1: z.string(),
  street2: z.string().optional(),
  street3: z.string().optional(),
  city: z.string(),
  zip: z.string(),
  state: z.string(),
  country: z.string(),
  async: z.boolean().optional(),
  validate: z.boolean().optional(),
})

const shipmentRequest = z.object({
  address_from: address,
  address_to: address,
  async: z.boolean().optional(),
  customs_declaration: customsDeclarationRequest,
  parcels: z.union([z.string(), parcel, z.array(parcel)]),
})

const transactionRequest = z.object({
  shipment: shipmentRequest,
  servicelevel_token: z.string(),
  carrier_account: z.string(),
  label_file_type: z.union([z.literal('png'), z.literal('pdf')]),
})

export const shippoRouter = createRouter()
  .mutation('validateAddress', {
    input: addressRequest,
    async resolve({ ctx, input }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const validatedAddress = await validateAddress(input)

      return validatedAddress
    },
  })
  .mutation('createShipment', {
    input: shipmentRequest,
    async resolve({ ctx, input }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const createdShipment = await createShipment(input)

      return createdShipment
    },
  })
  .mutation('createTransaction', {
    input: transactionRequest,
    async resolve({ ctx, input }) {
      ctx.res?.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
      )

      const createdTransaction = await createTransaction(input)

      return createdTransaction
    },
  })
