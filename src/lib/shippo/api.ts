import merge from '~lib/merge'
import { client, rates } from './client'

export async function getAddressList() {
  const addressList = await client.address.list()

  return addressList.results
}

export async function validateAddress(address: Shippo.CreateAddressRequest) {
  const validatedAddress = await client.address.create(address)

  return validatedAddress
}

export async function getAddress(objectID: string) {
  const address = await client.address.retrieve(objectID)

  return address
}

export async function createCustomDeclaration(
  items: Shippo.CreateCustomsItemRequest[],
) {
  const createdShipment = await client.customsdeclaration.create({
    contents_type: 'MERCHANDISE',
    contents_explanation: 'Dress purchase',
    non_delivery_option: 'RETURN',
    certify: true,
    certify_signer: 'Larisa Froliak',
    items,
  })

  return createdShipment
}

export async function createShipment(shipment: Shippo.CreateShipmentRequest) {
  const createdShipment = await client.shipment.create(shipment)

  return createdShipment
}

export async function getRate(objectID: string) {
  const rate = await rates(objectID)

  return rate
}

export async function getShipment(objectID: string) {
  const rate = await rates(objectID)
  const shipment = await client.shipment.retrieve(rate.shipment)
  const promises = shipment.customs_declaration?.items?.map((item: string) =>
    client.customsitem.retrieve(item),
  )
  const items = promises ? await Promise.all(promises) : []

  return {
    rate,
    shipment: {
      ...shipment,
      customs_declaration:
        typeof shipment.customs_declaration === 'object'
          ? ({
              ...shipment.customs_declaration,
              items,
              eel_pfc:
                shipment.address_to.country === 'ca'
                  ? 'NOEEI_30_36'
                  : 'NOEEI_30_37_a',
              incoterm: 'DDU',
            } as Shippo.CreateCustomsDeclarationRequest)
          : shipment.customs_declaration,
    },
  }
}

export async function createTransaction(
  transaction: Shippo.CreateTransactionRequest,
) {
  const createdTransaction = await client.transaction.create(transaction)

  return createdTransaction
}

export async function getTransaction(objectID: string) {
  const transaction = await client.transaction.retrieve(objectID)

  return transaction
}
