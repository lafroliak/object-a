import AddToBasket from '@components/AddToBasket'
import IfElse from '@components/IfElse'
import { getLayout } from '@layouts/CatalogueLayout'
import { simplyFetchFromGraph } from '@lib/crystallize/graph'
import documentQuery from '@lib/crystallize/graph/queries/documentQuery'
import productQuery from '@lib/crystallize/graph/queries/productQuery'
import { isImage } from '@lib/crystallize/isType'
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next'
import dynamic from 'next/dynamic'

const Sequencer = dynamic(import('@components/Sequencer'), { ssr: false })

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
  if (catalogue && catalogue?.type !== 'product') return null

  return (
    <div className="w-full h-full">
      <AddToBasket item={catalogue} />
      <IfElse predicate={catalogue?.components?.[0]}>
        {(prop) => (
          <IfElse
            predicate={isImage(prop.type, prop.content) ? prop.content : null}
          >
            {(content) => (
              <IfElse predicate={content?.images}>
                {(images) => (
                  <div
                    className={`relative w-full h-full bg-${catalogue?.topics?.[0].name}`}
                  >
                    <Sequencer list={images.map((x) => x.url)} />
                  </div>
                )}
              </IfElse>
            )}
          </IfElse>
        )}
      </IfElse>
    </div>
  )
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
      query: `
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
