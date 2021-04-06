import { simplyFetchFromGraph } from './graph'
import { Item, Product } from './types'

export async function getAllPages() {
  const { data } = await simplyFetchFromGraph({
    query: /* GraphQL */ `
      query ALL_PAGES(
        $language: String!
        $path: String!
        $version: VersionLabel!
      ) {
        catalogue(path: $path, language: $language, version: $version) {
          name
          children {
            type
            path
            name
          }
        }
      }
    `,
    variables: {
      language: 'en',
      path: '/',
      version: 'published',
    },
  })

  return data.catalogue?.children
    ? ((data.catalogue?.children || [])
        .filter((c) => c.type === 'document')
        .reverse() as Partial<Item>[])
    : null
}

export async function getAllProducts() {
  const { data } = await simplyFetchFromGraph({
    query: /* GraphQL */ `
      query ALL_PRODUCTS(
        $language: String!
        $path: String!
        $version: VersionLabel!
      ) {
        catalogue(path: $path, language: $language, version: $version) {
          name
          children {
            type
            path
            name
            ... on Product {
              updatedAt
              defaultVariant {
                images {
                  url
                  variants {
                    url
                    width
                  }
                }
              }
              variants {
                sku
                attributes {
                  attribute
                  value
                }
                stock
              }
            }
          }
        }
      }
    `,
    variables: {
      language: 'en',
      path: '/',
      version: 'published',
    },
  })

  return data.catalogue?.children
    ? ((data.catalogue?.children || []).filter(
        (c) => c.type === 'product',
      ) as Partial<Product>[])
    : null
}
