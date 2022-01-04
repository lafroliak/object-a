import { NodeProps } from '@crystallize/react-content-transformer'
import clsx from 'clsx'
import { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import getConfig from 'next/config'
import React, { useEffect, useMemo, useState } from 'react'
import { match, select } from 'ts-pattern'
import CrystallizeContent from '~components/CrystallizeContent'
import Popup, { SIDES } from '~components/Popup'
import Products from '~components/Products'
import Subscribe from '~components/Subscribe'
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
import useDrawer from '~stores/useDrawer'

const { publicRuntimeConfig } = getConfig()

export async function getStaticProps(context: GetStaticPropsContext) {
  const { preview } = context

  const { data } = await simplyFetchFromGraph({
    query: /* GraphQL */ `
      query HOME_PAGE(
        $language: String!
        $path: String!
        $version: VersionLabel!
      ) {
        catalogue(path: $path, language: $language, version: $version) {
          ...item
          ...product
          topics {
            path
            name
          }
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
    revalidate: 15,
  }
}

function HomePage({ page }: InferGetStaticPropsType<typeof getStaticProps>) {
  const opened = useDrawer((state) => state.opened)
  const [popupOpened, setPopupOpened] = useState<string>('')

  useEffect(() => {
    if (opened) setPopupOpened('')
  }, [opened])

  const images = useMemo(() => {
    const res = []
    const image = page.image?.images?.[0].variants?.find(
      (i) => i.width >= 1200 && i.url?.includes('png'),
    )
    if (image) {
      res.push({
        url: image.url,
        width: image.width,
        height: image.height || image.width,
        alt: page.title?.text || undefined,
      })
    }
    return res
  }, [page])

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
            className={clsx('max-w-3xl mx-auto px-4 md:px-8', {
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
            isModelsList={idx === 3}
            topics={page.topics}
          />
        ),
      )
      .otherwise(() => <></>)

  return (
    <>
      <NextSeo
        title={page.title?.text || undefined}
        description={
          (page.intro?.json as NodeProps[])?.[0]?.children?.[0]?.textContent
        }
        openGraph={{
          type: 'website',
          url: publicRuntimeConfig.SITE_URL,
          title: page.title?.text || undefined,
          description: (page.intro?.json as NodeProps[])?.[0]?.children?.[0]
            ?.textContent,
          site_name: page.title?.text || undefined,
          images,
        }}
      />
      <div className="py-12 space-y-12 md:py-24 md:space-y-24">
        {page.blocks.map(renderBlock)}
        <aside className="grid w-full place-items-center">
          <button
            type="button"
            onClick={() => void setPopupOpened('subscribe')}
            className="inline-block text-lg uppercase md:transition-colors md:ease-in-out md:delay-100 md:text-color-900/0 md:dark:text-color-100/0 md:bg-clip-text md:bg-gradient-to-r md:from-color-900 md:dark:from-color-100 md:hover:from-rose-500 md:to-color-900 md:dark:to-color-100 md:hover:to-cyan-500"
          >
            [subscribe]
          </button>
        </aside>
      </div>
      <Popup
        opened={Boolean(popupOpened)}
        onClose={() => void setPopupOpened('')}
        as="aside"
        side={SIDES.Left}
        content={
          <div className="relative h-full p-8 space-y-6 text-sm">
            <Subscribe onClose={() => void setPopupOpened('')} />
          </div>
        }
      />
    </>
  )
}

HomePage.getLayout = getLayout

export default HomePage
