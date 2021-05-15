export default /* GraphQL */ `
  query getAllOrders {
    orders {
      getAll {
        edges {
          node {
            id
            payment {
              __typename
              ... on StripePayment {
                orderId
                customerId
                paymentMethod
                paymentIntentId
                subscriptionId
                metadata
              }
            }
          }
        }
      }
    }
  }
`
