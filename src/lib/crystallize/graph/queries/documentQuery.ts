import fragments from '../fragments'

export default /* GraphQL */ `
  query FOLDER_PAGE(
    $language: String!
    $path: String
    $version: VersionLabel!
  ) {
    catalogue(language: $language, path: $path, version: $version) {
      ...item

      children {
        ...item
        ...product
      }
    }
  }

  ${fragments}
`
