import clsx from 'clsx'
import { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import React, { useEffect, useRef } from 'react'
import { match, select } from 'ts-pattern'

import CrystallizeContent from '~components/CrystallizeContent'
import Products from '~components/Products'
import { getLayout } from '~layouts/HomeLayout'
import { simplyFetchFromGraph } from '~lib/crystallize/graph'
import fragments from '~lib/crystallize/graph/fragments'
import {
  ComponentType,
  GridRow,
  Item,
  RichTextContent,
} from '~lib/crystallize/types'
import { getBlocks, WithType } from '~lib/getBlocks'

export async function getStaticProps(context: GetStaticPropsContext) {
  const { preview } = context

  const { data } = await simplyFetchFromGraph({
    query: `
      query HOME_PAGE($language: String!, $path: String!,  $version: VersionLabel!) {
        catalogue(path: $path, language: $language, version: $version) {
          ...item
          ...product
        }
      }

      ${fragments}
    `,
    variables: {
      language: 'en',
      path: '/homepage',
      version: preview ? 'draft' : 'published',
    },
  })

  const page = getBlocks(data.catalogue as Item)

  return {
    props: {
      page,
    },
    revalidate: 30,
  }
}

const renderBlock = (
  block:
    | WithType<GridRow, ComponentType.GridRelations>
    | WithType<RichTextContent, ComponentType.ParagraphCollection>,
  idx: number,
): JSX.Element =>
  match(block)
    .with(
      { type: ComponentType.ParagraphCollection, json: select('json') },
      ({ json }) => (
        <div
          key={`${ComponentType.ParagraphCollection}-${idx}`}
          className={clsx('max-w-3xl mx-auto text-capsize', {
            italic: idx === 0,
          })}
        >
          <CrystallizeContent content={json as RichTextContent['json']} />
        </div>
      ),
    )
    .with(
      { type: ComponentType.GridRelations, columns: select('columns') },
      ({ columns }) => (
        <Products
          key={`${ComponentType.GridRelations}-${idx}`}
          columns={columns as GridRow['columns']}
        />
      ),
    )
    .otherwise(() => <></>)

function HomePage({ page }: InferGetStaticPropsType<typeof getStaticProps>) {
  const images = useRef([
    {
      url: `${process.env.VERCEL_URL}/og-image.png`,
      width: 1200,
      height: 630,
      alt: page.title?.text || undefined,
    },
  ])

  useEffect(() => {
    const image = page.image?.images?.[0].variants?.find((i) => i.width > 1200)
    if (image) {
      images.current.push({
        url: image.url,
        width: image.width,
        height: image.height || image.width * 0.68,
        alt: page.title?.text || undefined,
      })
    }
  }, [page])

  return (
    <>
      <NextSeo
        title={page.title?.text || undefined}
        description={page.intro?.plainText?.join('. ') || undefined}
        openGraph={{
          type: 'website',
          url: process.env.VERCEL_URL,
          title: page.title?.text || undefined,
          description: page.intro?.plainText?.join('. ') || undefined,
          site_name: page.title?.text || undefined,
          images: images.current,
        }}
      />
      {page.blocks.map(renderBlock)}
    </>
  )
}

HomePage.getLayout = getLayout

export default HomePage
