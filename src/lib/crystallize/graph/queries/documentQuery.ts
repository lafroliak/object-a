import fragments from '../fragments'

export default `
  query FOLDER_PAGE($language: String!, $path: String, $version: VersionLabel!) {
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
