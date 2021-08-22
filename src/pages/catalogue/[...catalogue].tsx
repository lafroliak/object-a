import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next'

import DocumentPage from '~components/DocumentPage'
import IfElse from '~components/IfElse'
import ProductPage from '~components/ProductPage'
import { getLayout } from '~layouts/CatalogueLayout'
import { simplyFetchFromGraph } from '~lib/crystallize/graph'
import documentQuery from '~lib/crystallize/graph/queries/documentQuery'
import productQuery from '~lib/crystallize/graph/queries/productQuery'
import { Item, Product } from '~lib/crystallize/types'

export async function getStaticProps(
  context: GetStaticPropsContext<{ catalogue: Array<string> }>,
) {
  const { params, preview } = context
  const catalogue = params?.catalogue

  let asPath
  try {
    asPath = `/${catalogue?.join('/')}`

    // Get the item type
    const getItemType = await simplyFetchFromGraph({
      query: `
        query ITEM_TYPE($language: String!, $path: String!) {
          catalogue(language: $language, path: $path) {
            type
            language
            children {
              type
            }
          }
        }
      `,
      variables: {
        language: 'en',
        path: asPath,
      },
    })

    const type = getItemType.data.catalogue?.type

    if (type === 'search' || !type) {
      return {
        props: {},
        revalidate: 1,
      }
    }

    const { data } = await simplyFetchFromGraph({
      query: type === 'product' ? productQuery : documentQuery,
      variables: {
        path: asPath,
        language: 'en',
        version: preview ? 'draft' : 'published',
      },
    })

    return {
      props: {
        catalogue: data.catalogue || null,
      },
      revalidate: 1,
    }
  } catch (error) {
    console.log(error)
    console.warn(`Could not get data for ${asPath}`)
  }

  return {
    props: {},
    revalidate: 1,
  }
}

function CataloguePage({
  catalogue,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!catalogue) return null

  if (catalogue.type === 'document') {
    return (
      <IfElse
        predicate={catalogue?.type === 'document' ? (catalogue as Item) : null}
      >
        {(page) => (
          <section className="w-full max-h-full min-h-full px-8 py-12 mx-auto space-y-6 overflow-y-auto text-sm scrollzone bg-color-100 dark:bg-color-800 max-w-prose">
            <DocumentPage page={page} />
          </section>
        )}
      </IfElse>
    )
  }

  if (catalogue.type === 'product') {
    return (
      <>
        <IfElse
          predicate={
            catalogue.type === 'product' ? (catalogue as Product) : null
          }
        >
          {(page) => 
          <ProductPage page={page} />}
        </IfElse>
      </>
    )
  }

  return null
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const paths: GetStaticPathsResult['paths'] = []

  function handleItem({
    path,
    name,
  }: {
    path?: string | null
    name?: string | null
  }) {
    if (path && path !== '/index' && !name?.startsWith('_')) {
      paths.push(`/catalogue${path}`)
    }
  }

  try {
    const allCatalogueItems = await simplyFetchFromGraph({
      query: /* GraphQL */ `
        query GET_ALL_CATALOGUE_ITEMS($language: String!) {
          catalogue(language: $language, path: "/") {
            path
            name
            children {
              path
              name
              children {
                path
                name
                children {
                  path
                  name
                  children {
                    path
                    name
                    children {
                      path
                      name
                      children {
                        path
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        language: 'en',
      },
    })

    allCatalogueItems.data.catalogue?.children?.forEach(handleItem)
  } catch (error) {
    console.error('Could not get all catalogue items')
    console.log(error)
  }

  return {
    paths,
    fallback: true,
  }
}

CataloguePage.getLayout = getLayout

export default CataloguePage
