import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { NextSeo } from 'next-seo'
import getConfig from 'next/config'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
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
import useDrawer from '~stores/useDrawer'
import { Option } from '~typings/utils'
import AddToCart from './AddToCart'
import CrystallizeContent from './CrystallizeContent'
import { SIDES } from './Drawers'
import IconModel from './IconModel'
import IconThreeD from './IconThreeD'
import IfElse from './IfElse'
import Popup from './Popup'
const { publicRuntimeConfig } = getConfig()

const PageContent = dynamic(import('./PageContent'), {
  loading: function Placeholder() {
    return <p>[loading...]</p>
  },
  ssr: false,
})

const Sequencer = dynamic(import('~components/Sequencer'), { ssr: false })

type Props = {
  page: Product
}

export default function ProductPage({ page }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setSize] = useState<number>(0)
  const [popupOpened, setPopupOpened] = useState<boolean>(false)
  const [sku, setSKU] = useState<Option<string>>(null)
  const [state, setState] = useState<Option<'Images' | 'Models'>>(null)
  const openedDrawer = useDrawer((state) => state.opened)
  const { asPath } = useRouter()

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

  useEffect(() => {
    if (openedDrawer) setPopupOpened(false)
  }, [openedDrawer])

  const image = useMemo(() => {
    const component = page.components?.find(
      (c) => c?.name === 'Images' && c?.content,
    )
    const content =
      component && isImage(component.type, component.content)
        ? component.content
        : null
    const image = content?.images?.reduce<ImageVariant | null>((res, img) => {
      const variant = img.variants?.find(
        (v) => v.url.includes('png') && v.width === 1024,
      )
      if (variant) return variant
      return res
    }, null)
    return image
  }, [page.components])

  return (
    <>
      <NextSeo
        title={
          (
            page.components?.find((c) => c?.name === 'Title')
              ?.content as SingleLineContent
          )?.text || undefined
        }
        openGraph={{
          type: 'website',
          url: `${publicRuntimeConfig.SITE_URL}${asPath}`,
          title:
            (
              page.components?.find((c) => c?.name === 'Title')
                ?.content as SingleLineContent
            )?.text || undefined,
          images: image
            ? [
                {
                  url: image.url,
                  width: image.width,
                  height: image.height || image.width,
                  alt: '',
                },
              ]
            : undefined,
        }}
      />
      <div className={clsx('grid w-full min-h-full', styles.container)}>
        <div
          className={clsx(
            'grid place-items-center relative overflow-visible',
            styles.image,
          )}
        >
          <IfElse
            predicate={page.components?.find(
              (c) => c?.name === 'Images' && c?.content,
            )}
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
                      <div className="relative w-[95vw] h-[95vw] md:w-[75vmin] md:h-[75vmin]">
                        <IfElse
                          predicate={images.length > 1 ? images : null}
                          placeholder={
                            <img
                              className="absolute inset-0 object-contain w-full h-full overflow-hidden"
                              src={images[0].url}
                              alt={page.name || ''}
                              width={images[0].width}
                              height={images[0].height || images[0].width}
                            />
                          }
                        >
                          {() => (
                            <div className="absolute inset-0" ref={ref}>
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
                                              isWebpSupported()
                                                ? 'webp'
                                                : 'png',
                                            ) && v.width === 500,
                                        )?.url,
                                  undefined,
                                )}
                                pageID={page.id}
                                list={images.map((x) => x.url)}
                                width={width}
                              />
                            </div>
                          )}
                        </IfElse>
                      </div>
                    )}
                  </IfElse>
                )}
              </IfElse>
            )}
          </IfElse>
          <AnimatePresence>
            <IfElse
              predicate={
                state === 'Models'
                  ? page.components?.find(
                      (c) => c?.name === 'Models' && c?.content,
                    )
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
                            v.url.includes(
                              isWebpSupported() ? 'webp' : 'png',
                            ) && v.width === 1024,
                        )
                        if (m) {
                          return [...res, m]
                        }
                        return res
                      }, [] as ImageVariant[])}
                    >
                      {(images) => (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 grid grid-flow-col md:grid-flow-row grid-col-[minmax(min-content,max-content)] md:grid-row-[minmax(min-content,max-content)] gap-4 overflow-x-auto place-items-center md:overflow-y-auto md:overflow-x-hidden scrollzone bg-color-200 dark:bg-color-900"
                        >
                          {images.map((image) => (
                            <picture
                              key={image.url}
                              className="relative w-[75vmin] h-[75vmin]"
                            >
                              <img
                                className="absolute inset-0 object-contain w-full h-full overflow-hidden"
                                src={image.url}
                                alt=""
                                width={image.width}
                                height={image.height || image.width}
                              />
                            </picture>
                          ))}
                        </motion.div>
                      )}
                    </IfElse>
                  )}
                </IfElse>
              )}
            </IfElse>
          </AnimatePresence>
          <IfElse
            predicate={page.components?.find(
              (c) => c?.name === 'Models' && c?.content,
            )}
          >
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
            'grid place-content-start md:overflow-y-auto scrollzone',
            styles.details,
          )}
        >
          <div className="w-full px-4 py-8 space-y-8 md:pl-1 max-w-prose">
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
                      <div className="pb-1 text-xs font-semibold border-b border-color-500">
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
                  <div className="flex flex-row justify-between w-full pb-1 text-xs font-semibold border-b border-color-500">
                    <span>{'Size '}</span>
                    <button
                      type="button"
                      className="uppercase cursor-pointer focus:outline-none"
                      onClick={() => void setPopupOpened(true)}
                    >
                      [size guide]
                    </button>
                  </div>
                  <div className="space-x-4">
                    {variants.map((v) => (
                      <Fragment key={v.sku}>
                        <IfElse
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
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}
            </IfElse>
            <IfElse predicate={page.variants?.[0]?.priceVariants?.[0]?.price}>
              {(price) => (
                <div className="space-y-2">
                  <div className="pb-1 text-xs font-semibold border-b border-color-500">
                    {'Price'}
                  </div>
                  <div className="text-sm">
                    ${price}
                    <IfElse
                      predicate={
                        (
                          page.components?.find((c) => c?.name === 'Sold out')
                            ?.content as BooleanContent
                        )?.value
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
      <Popup
        opened={popupOpened}
        onClose={() => void setPopupOpened(false)}
        as="aside"
        side={SIDES.Right}
        content={
          <div className="p-8 space-y-6">
            <PageContent path="/size-guide" />
          </div>
        }
      />
    </>
  )
}
