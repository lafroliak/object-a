import { client } from './client'

export async function getAddressList() {
  const addressList = await client.address.list()

  return addressList.results
}

export async function validateAddress(address: Shippo.CreateAddressRequest) {
  const validatedAddress = await client.address.create(address)

  return validatedAddress
}

export async function createShipment(shipment: Shippo.CreateShipmentRequest) {
  const createdShipment = await client.shipment.create(shipment)

  return createdShipment
}

export async function createTransaction(
  transaction: Shippo.CreateTransactionRequest,
) {
  const createdTransaction = await client.transaction.create(transaction)

  return createdTransaction
}

/* 
const addressFrom = {
  name: 'Ms Hippo',
  company: 'client',
  street1: '215 Clayton St.',
  city: 'San Francisco',
  state: 'CA',
  zip: '94117',
  country: 'US', //iso2 country code
  phone: '+1 555 341 9393',
  email: 'support@goshippo.com',
}

// example address_to object dict
const addressTo = {
  name: 'Ms Hippo',
  company: 'Shippo',
  street1: '803 Clayton St.',
  city: 'San Francisco',
  state: 'CA',
  zip: '94117',
  country: 'US', //iso2 country code
  phone: '+1 555 341 9393',
  email: 'support@goshippo.com',
}

// parcel object dict
const parcelOne = {
  length: '5',
  width: '5',
  height: '5',
  distance_unit: 'in',
  weight: '2',
  mass_unit: 'lb',
} as Shippo.Parcel

const parcelTwo = {
  length: '5',
  width: '5',
  height: '5',
  distance_unit: 'in',
  weight: '2',
  mass_unit: 'lb',
} as Shippo.Parcel

const shipment = {
  address_from: addressFrom,
  address_to: addressTo,
  parcels: [parcelOne, parcelTwo],
}

client.shipment.create({
  address_from: addressFrom,
  address_to: addressTo,
  parcels: [parcelOne, parcelTwo],
  async: false,
})

client.transaction
  .create({
    shipment: shipment,
    servicelevel_token: 'ups_ground',
    carrier_account: '558c84bbc25a4f609f9ba02da9791fe4',
    label_file_type: 'png',
  })
  .then(
    function (transaction) {
      client.transaction
        .list({
          rate: transaction.rate,
        })
        .then(function (mpsTransactions) {
          mpsTransactions.results.forEach(function (mpsTransaction) {
            if (mpsTransaction.status == 'SUCCESS') {
              console.log('Label URL: %s', mpsTransaction.label_url)
              console.log('Tracking Number: %s', mpsTransaction.tracking_number)
            } else {
              // hanlde error transactions
              console.log('Message: %s', mpsTransactions.messages)
            }
          })
        })
    },
    function (err) {
      // Deal with an error
      console.log('There was an error creating transaction : %s', err.detail)
    },
  )
*/
