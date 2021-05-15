import fragments from '../fragments'

export default /* GraphQL */ `
  query PRODUCT_PAGE(
    $language: String!
    $path: String
    $version: VersionLabel!
  ) {
    catalogue(language: $language, path: $path, version: $version) {
      ...item
      ...product

      topics {
        id
        name
        items(first: 4) {
          edges {
            node {
              ...item
              ...product
            }
          }
        }
      }
    }
  }

  ${fragments}
`
