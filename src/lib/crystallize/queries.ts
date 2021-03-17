import { simplyFetchFromGraph } from './graph'
import { Item } from './types'

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
    ? ((data.catalogue?.children || []).filter(
        (c) => c.type === 'document',
      ) as Item[])
    : null
}
