const createOrder = /* GraphQL */ `
  mutation createOrder(
    $customer: CustomerInput!
    $cart: [OrderItemInput!]!
    $payment: [PaymentInput!]
    $total: PriceInput
    $additionalInformation: String
    $meta: [OrderMetadataInput!]
  ) {
    orders {
      create(
        input: {
          customer: $customer
          cart: $cart
          payment: $payment
          total: $total
          additionalInformation: $additionalInformation
          meta: $meta
        }
      ) {
        id
      }
    }
  }
`

export default createOrder
