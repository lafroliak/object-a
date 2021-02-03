import Body from '@components/Body'
import IfElse from '@components/IfElse'
import Intro from '@components/Intro'
import Products from '@components/Products'
import { getLayout } from '@layouts/HomeLayout'
import { simplyFetchFromGraph } from '@lib/crystallize/graph'
import fragments from '@lib/crystallize/graph/fragments'
import { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import React from 'react'

export async function getStaticProps(context: GetStaticPropsContext) {
  const { preview } = context

  const { data } = await simplyFetchFromGraph({
    query: `
      query HOME_PAGE($language: String!, $path: String!,  $version: VersionLabel!) {
        catalogue(path: $path, language: $language, version: $version) {
          ...item
          ...product

          children {
            ...item
            ...product
          }
        }
      }

      ${fragments}
    `,
    variables: {
      language: 'en',
      path: '/',
      version: preview ? 'draft' : 'published',
    },
  })

  return {
    props: {
      catalogue: data.catalogue?.children || null,
    },
    revalidate: 10,
  }
}

function HomePage({
  catalogue,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="py-12 space-y-12">
      {catalogue?.map((item) => (
        <IfElse
          key={item.id}
          predicate={
            item.type === 'document' &&
            item.components?.find((x) => x?.name === 'Intro')
              ? item
              : undefined
          }
        >
          {(prop) => <Intro item={prop} />}
        </IfElse>
      ))}
      {catalogue?.map((item) => (
        <IfElse
          key={item.id}
          predicate={
            item.type === 'document' &&
            item.components?.find((x) => x?.name === 'Products')
              ? item
              : undefined
          }
        >
          {(prop) => <Products item={prop} row={0} />}
        </IfElse>
      ))}
      {catalogue?.map((item) => (
        <IfElse
          key={item.id}
          predicate={
            item.type === 'document' &&
            item.components?.find((x) => x?.name === 'Body')
              ? item
              : undefined
          }
        >
          {(prop) => <Body item={prop} />}
        </IfElse>
      ))}
      {catalogue?.map((item) => (
        <IfElse
          key={item.id}
          predicate={
            item.type === 'document' &&
            item.components?.find((x) => x?.name === 'Products')
              ? item
              : undefined
          }
        >
          {(prop) => <Products item={prop} row={1} />}
        </IfElse>
      ))}
    </div>
  )
}

HomePage.getLayout = getLayout

export default HomePage
