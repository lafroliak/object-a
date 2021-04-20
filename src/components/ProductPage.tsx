import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import * as styles from '~layouts/CatalogueLayout.module.css'
import { isImage } from '~lib/crystallize/isType'
import {
  BooleanContent,
  ImageVariant,
  Product,
  RichTextContent,
  SingleLineContent,
} from '~lib/crystallize/types'
import { isWebpSupported } from '~lib/isWebpSupported'
import { Option } from '~typings/utils'

import AddToCart from './AddToCart'
import CrystallizeContent from './CrystallizeContent'
import IconModel from './IconModel'
import IconThreeD from './IconThreeD'
import IfElse from './IfElse'

const Sequencer = dynamic(import('~components/Sequencer'), { ssr: false })

type Props = {
  page: Product
}

export default function ProductPage({ page }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setSize] = useState<number>(0)
  const [sku, setSKU] = useState<Option<string>>(null)
  const [state, setState] = useState<Option<'Images' | 'Models'>>(null)

  useEffect(() => {
    const defaultVariant = page.variants?.find((v) => (v?.stock ?? 0) > 0)
    if (defaultVariant?.sku) {
      setSKU(defaultVariant.sku)
    }
  }, [page.variants])

  useEffect(() => {
    setState(
      (page.components?.find((c) => c?.name === 'Images')?.name as 'Images') ||
        null,
    )
  }, [page.components])

  useEffect(() => {
    if (ref.current) {
      setSize(ref.current.getBoundingClientRect().width ?? 0)
    }
  }, [ref])

  return (
    <div
      className={clsx('grid w-full h-full overflow-hidden', styles.container)}
    >
      <div
        className={clsx(
          'grid justify-center relative overflow-auto scrollzone',
          styles.image,
        )}
      >
        <IfElse predicate={page.components?.find((c) => c?.name === 'Images')}>
          {(component) => (
            <IfElse
              predicate={
                isImage(component.type, component.content)
                  ? component.content
                  : null
              }
            >
              {(content) => (
                <IfElse
                  predicate={content?.images?.reduce((res, i) => {
                    const m = i.variants?.find(
                      (v) =>
                        v.url.includes(isWebpSupported() ? 'webp' : 'png') &&
                        v.width === 1024,
                    )
                    if (m) {
                      return [...res, m]
                    }
                    return res
                  }, [] as ImageVariant[])}
                >
                  {(images) => (
                    <div className="relative w-[75vmin] h-[75vmin]">
                      <div
                        className="absolute inset-0 cursor-grab active:cursor-grabbing"
                        ref={ref}
                      >
                        <Sequencer
                          placeholder={content?.images?.reduce<
                            string | undefined
                          >(
                            (res, i) =>
                              res
                                ? res
                                : i.variants?.find(
                                    (v) =>
                                      v.url.includes(
                                        isWebpSupported() ? 'webp' : 'png',
                                      ) && v.width === 500,
                                  )?.url,
                            undefined,
                          )}
                          list={images.map((x) => x.url)}
                          width={width}
                        />
                      </div>
                    </div>
                  )}
                </IfElse>
              )}
            </IfElse>
          )}
        </IfElse>
        <IfElse
          predicate={
            state === 'Models'
              ? page.components?.find((c) => c?.name === 'Models')
              : undefined
          }
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
                <IfElse
                  predicate={content?.images?.reduce((res, i) => {
                    const m = i.variants?.find(
                      (v) =>
                        v.url.includes(isWebpSupported() ? 'webp' : 'png') &&
                        v.width === 1024,
                    )
                    if (m) {
                      return [...res, m]
                    }
                    return res
                  }, [] as ImageVariant[])}
                >
                  {(images) => (
                    <div className="absolute inset-0 py-12 overflow-x-auto bg-color-200 dark:bg-color-900 md:overflow-y-auto scrollzone">
                      <div className="grid w-full grid-flow-col gap-4 place-content-center auto-cols-auto auto-rows-auto md:grid-flow-row bg-color-200 dark:bg-color-900">
                        {console.log(images)}
                        {images.map((image) => (
                          <div
                            key={image.key}
                            className="relative w-[75vh] h-[75vh] overflow-hidden"
                          >
                            <img
                              src={image.url}
                              alt={page.name ?? ''}
                              width={image.width}
                              className="absolute inset-0 w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </IfElse>
              )}
            </IfElse>
          )}
        </IfElse>
        <IfElse predicate={page.components?.find((c) => c?.name === 'Models')}>
          {() => (
            <div className="absolute top-0 left-0 m-4 space-y-4 md:m-8">
              <button
                type="button"
                className={clsx(
                  'grid place-content-center w-8 h-8 cursor-pointer bg-color-100 dark:bg-color-800',
                  {
                    'ring-1 ring-color-500': state === 'Images',
                    'bg-opacity-50': state !== 'Images',
                  },
                )}
                onClick={() => setState('Images')}
              >
                <span className="text-xl">
                  <IconThreeD />
                </span>
              </button>
              <button
                type="button"
                className={clsx(
                  'grid place-content-center w-8 h-8 cursor-pointer bg-color-100 dark:bg-color-800',
                  {
                    'ring-1 ring-color-500': state === 'Models',
                    'bg-opacity-50': state !== 'Models',
                  },
                )}
                onClick={() => setState('Models')}
              >
                <span className="text-xl">
                  <IconModel />
                </span>
              </button>
            </div>
          )}
        </IfElse>
      </div>
      <div
        className={clsx(
          'grid place-content-start overflow-y-auto scrollzone',
          styles.details,
        )}
      >
        <div className="w-full py-8 pl-1 pr-4 space-y-8 max-w-prose">
          <IfElse predicate={page.name}>
            {(name) => <h1 className="text-base">{name}</h1>}
          </IfElse>
          <IfElse
            predicate={page.components?.find((c) => c?.name === 'Details')}
          >
            {(component) => (
              <IfElse
                predicate={
                  component?.type === 'richText'
                    ? (component?.content as RichTextContent)
                    : null
                }
              >
                {(content) => (
                  <div className="text-sm">
                    <CrystallizeContent content={content.json} />
                  </div>
                )}
              </IfElse>
            )}
          </IfElse>
          <IfElse
            predicate={page.components?.find((c) => c?.name === 'Material')}
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
                  <div className="space-y-2">
                    <div className="pb-1 text-xs border-b border-color-500">
                      {'Material'}
                    </div>
                    <div className="text-sm">{content.text}</div>
                  </div>
                )}
              </IfElse>
            )}
          </IfElse>
          <IfElse predicate={page.variants}>
            {(variants) => (
              <div className="space-y-4">
                <div className="pb-1 text-xs border-b border-color-500">
                  {'Size'}
                </div>
                <div className="space-x-4">
                  {variants.map((v) => (
                    <>
                      <IfElse
                        key={v.sku}
                        predicate={(v?.stock ?? 0) > 0 ? v : null}
                        placeholder={
                          <span
                            key={`span-${v.sku}`}
                            className={clsx(
                              'inline-block relative px-3 py-1 opacity-50 bg-color-100 dark:bg-color-800',
                            )}
                          >
                            <span className="inline-block text-capsize">
                              {v.attributes?.[0]?.value}
                            </span>
                            <span className="absolute inline-block w-2 h-2 bg-red-600 rounded -top-1 -right-1" />
                          </span>
                        }
                      >
                        {() => (
                          <button
                            key={`button-${v.sku}`}
                            type="button"
                            className={clsx(
                              'inline-block px-3 py-1 cursor-pointer bg-color-100 dark:bg-color-800',
                              {
                                'ring-1 ring-color-500': v.sku === sku,
                                'bg-opacity-50': v.sku !== sku,
                              },
                            )}
                            onClick={() => setSKU(v.sku)}
                          >
                            <span className="inline-block text-capsize">
                              {v.attributes?.[0]?.value}
                            </span>
                          </button>
                        )}
                      </IfElse>
                    </>
                  ))}
                </div>
              </div>
            )}
          </IfElse>
          <IfElse predicate={page.variants?.[0]?.priceVariants?.[0]?.price}>
            {(price) => (
              <div className="space-y-2">
                <div className="pb-1 text-xs border-b border-color-500">
                  {'Price'}
                </div>
                <div className="text-sm">
                  ${price}
                  <IfElse
                    predicate={
                      (page.components?.find((c) => c?.name === 'Sold out')
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
              </div>
            )}
          </IfElse>
          <IfElse predicate={!!sku}>
            {() => <AddToCart item={page} sku={sku} />}
          </IfElse>
        </div>
      </div>
    </div>
  )
}
