import * as styles from '@layouts/CatalogueLayout.module.css'
import { isImage } from '@lib/crystallize/isType'
import {
  BooleanContent,
  ImageVariant,
  Product,
  RichTextContent,
  SingleLineContent,
} from '@lib/crystallize/types'
import { isWebpSupported } from '@lib/isWebpSupported'
import { Option } from '@typings/utils'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import AddToBasket from './AddToBasket'
import CrystallizeContent from './CrystallizeContent'
import IfElse from './IfElse'

const Sequencer = dynamic(import('@components/Sequencer'), { ssr: false })

type Props = {
  page: Product
}

export default function ProductPage({ page }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setSize] = useState<number>(0)
  const widthRef = ref.current?.getBoundingClientRect().width
  const [instructionOn, setInstructionOn] = useState<boolean>(true)
  const [sku, setSKU] = useState<Option<string>>(null)

  useEffect(() => {
    const defaultVariant = page.variants?.find((v) => (v?.stock ?? 0) > 0)
    if (defaultVariant?.sku) {
      setSKU(defaultVariant.sku)
    }
  }, [page.variants])

  useEffect(() => {
    setSize(ref.current?.getBoundingClientRect().width || 0)
  }, [widthRef])

  return (
    <div className={clsx('grid w-full h-full', styles.container)}>
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
                  <div
                    className={clsx('grid place-items-center', styles.image)}
                  >
                    <div className="relative w-full aspect-w-1 aspect-h-1">
                      <div
                        className="absolute inset-0 cursor-grab active:cursor-grabbing"
                        ref={ref}
                      >
                        <Sequencer
                          list={images.map((x) => x.url)}
                          width={width}
                        />
                      </div>
                      <AnimatePresence>
                        <IfElse predicate={instructionOn}>
                          {(prop) => (
                            <motion.div
                              layoutId="instruction"
                              key={prop ? 'instruction' : 'nope'}
                              initial={{ opacity: 1 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                type: 'spring',
                                damping: 60,
                                stiffness: 180,
                              }}
                              className="absolute inset-0 bg-center bg-no-repeat cursor-pointer"
                              style={{
                                backgroundImage: 'url(/instruction.gif)',
                              }}
                              onClick={() => setInstructionOn(false)}
                            />
                          )}
                        </IfElse>
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </IfElse>
            )}
          </IfElse>
        )}
      </IfElse>
      <div className={clsx('grid place-content-center', styles.details)}>
        <div className="w-full py-4 pr-4 space-y-8 max-w-prose">
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
            {() => <AddToBasket item={page} sku={sku} />}
          </IfElse>
        </div>
      </div>
    </div>
  )
}
