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
import * as styles from '@layouts/CatalogueLayout.module.css'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import {
  SingleLineContent,
  RichTextContent,
  Product,
  BooleanContent,
} from '@lib/crystallize/types'
import CrystallizeContent from '@components/CrystallizeContent'
import { number } from 'zod'

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
  const ref = useRef<HTMLDivElement>(null)
  const [[width, height], setSize] = useState<[number, number]>([0, 0])

  useEffect(() => {
    setSize([
      ref.current?.getBoundingClientRect().width || 0,
      ref.current?.getBoundingClientRect().height || 0,
    ])
  }, [
    ref.current?.getBoundingClientRect().width,
    ref.current?.getBoundingClientRect().height,
  ])

  if (!catalogue) return null

  return (
    <>
      <IfElse
        predicate={
          catalogue?.type === 'product' ? (catalogue as Product) : null
        }
        placeholder={<div>{JSON.stringify(catalogue, null, 2)}</div>}
      >
        {(cat) => (
          <div className={clsx('grid w-full h-full', styles.container)}>
            <IfElse
              predicate={cat.components?.find((c) => c?.name === 'Images')}
            >
              {(component) => (
                <IfElse
                  predicate={
                    isImage(component.type, component.content)
                      ? component.content
                      : null
                  }
                >
                  {(content) => (
                    <IfElse predicate={content?.images}>
                      {(images) => (
                        <div
                          ref={ref}
                          className={clsx(
                            'relative w-full h-full cursor-grab active:cursor-grabbing',
                            styles.image,
                          )}
                        >
                          <Sequencer
                            list={images.map((x) => x.url)}
                            width={width}
                            height={height}
                          />
                        </div>
                      )}
                    </IfElse>
                  )}
                </IfElse>
              )}
            </IfElse>
            <div
              className={clsx(
                'grid space-y-8 place-content-center py-4 pr-4',
                styles.details,
              )}
            >
              <IfElse predicate={catalogue.name}>
                {(name) => <h1>{name}</h1>}
              </IfElse>
              <IfElse
                predicate={cat.components?.find((c) => c?.name === 'Details')}
              >
                {(component) => (
                  <IfElse
                    predicate={
                      component?.type === 'richText'
                        ? (component?.content as RichTextContent)
                        : null
                    }
                  >
                    {(content) => <CrystallizeContent content={content.json} />}
                  </IfElse>
                )}
              </IfElse>
              <IfElse
                predicate={cat.components?.find((c) => c?.name === 'Material')}
              >
                {(component) => (
                  <IfElse
                    predicate={
                      component?.type === 'singleLine'
                        ? (component?.content as SingleLineContent)
                        : null
                    }
                  >
                    {(content) => (
                      <div>
                        {'Material: '}
                        {content.text}
                      </div>
                    )}
                  </IfElse>
                )}
              </IfElse>
              <IfElse predicate={cat.topics?.[0].name}>
                {(size) => (
                  <div>
                    {'Size: '}
                    {size}
                  </div>
                )}
              </IfElse>
              <IfElse predicate={cat.variants?.[0]?.priceVariants?.[0]?.price}>
                {(price) => (
                  <div>
                    {'Price: '}${price}
                    <IfElse
                      predicate={
                        (cat.components?.find((c) => c?.name === 'Sold out')
                          ?.content as BooleanContent)?.value
                      }
                    >
                      {() => (
                        <span className="pl-2 text-xs text-color-500">
                          [sold out]
                        </span>
                      )}
                    </IfElse>
                  </div>
                )}
              </IfElse>
              <AddToBasket item={cat} />
            </div>
          </div>
        )}
      </IfElse>
    </>
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
