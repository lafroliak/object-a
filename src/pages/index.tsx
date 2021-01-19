import React from 'react'
import { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import Link from 'next/link'

import { simplyFetchFromGraph } from '@lib/crystallize/graph'
import fragments from '@lib/crystallize/graph/fragments'
import ProductCard from '@components/ProductCard'
import { getLayout } from '@layouts/HomeLayout'
import CollapsableImage from '@components/CollapsableImage'
import ProductImage from '@components/ProductImage'

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

function HomePage({ catalogue }: InferGetStaticPropsType<typeof getStaticProps>) {
  const { SITE_NAME } = process.env

  return (
    <>
      <h1 className="text-xl text-gray-900">{SITE_NAME}</h1>
      <div>
        {catalogue?.map((item) => (
          <Link key={item.id} href={item.path ? `/catalogue${item.path}` : '/'}>
            <a>
              <ProductCard item={item} />
            </a>
          </Link>
        ))}
      </div>
    </>
  )
}

HomePage.getLayout = getLayout

export default HomePage
