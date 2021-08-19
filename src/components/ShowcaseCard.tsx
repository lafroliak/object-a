import { memo } from 'react'

import { Product } from '~lib/crystallize/types'
import { isWebpSupported } from '~lib/isWebpSupported'
import { trpc } from '~lib/trpc'
import { Option } from '~typings/utils'

import IfElse from './IfElse'

type Props = {
  item: Option<Partial<Product>>
  isLink?: boolean
  withProducts?: boolean
  withSize?: boolean
}

function ShowcaseCard({ item, isLink, withProducts, withSize }: Props) {
  const { data: productsData } = trpc.useQuery(
    ['crystallize.get-all-products'],
    {
      enabled: Boolean(withProducts && item),
    },
  )
  const itemFromProducts = withProducts
    ? productsData?.products?.find((p) =>
        p.variants?.some((v) => v?.sku == item?.variants?.[0]?.sku),
      )
    : null

  if (!item) return null

  const { name, type, variants, defaultVariant } = itemFromProducts || item
  if (type === 'folder' || type === 'document') return null

  const images =
    defaultVariant?.images || variants?.find((v) => v.images)?.images

  const image = images?.[0]?.variants?.find(
    (img) =>
      img.width === 500 && img.url.includes(isWebpSupported() ? 'webp' : 'png'),
  )
  const isOutOfStock = variants?.every((v) => (v?.stock ?? 0) === 0)
  const size = withSize ? item.variants?.[0].attributes?.[0]?.value : null

  return (
    <>
      <IfElse predicate={image}>
        {(prop) => (
          <picture className="relative flex-1 block w-full h-full aspect-w-1 aspect-h-1">
            <img
              className="absolute inset-0 object-contain w-full h-full overflow-hidden"
              src={prop.url}
              alt={`${item?.name || ''}`}
              width={prop.width}
              height={prop.height || prop.width}
            />
          </picture>
        )}
      </IfElse>
      <IfElse predicate={name}>
        {(prop) => (
          <h3 className="text-sm text-center uppercase whitespace-nowrap">
            <span className="relative">
              {isLink ? '[' : null}
              {prop.trim()}
              {isLink ? ']' : null}
              <IfElse predicate={isOutOfStock}>
                {() => (
                  <span className="absolute inline-block w-2 h-2 bg-red-600 rounded -top-1 -right-3" />
                )}
              </IfElse>
            </span>
            {size ? (
              <div className="text-xs">{`size ${size.toUpperCase()}`}</div>
            ) : null}
          </h3>
        )}
      </IfElse>
    </>
  )
}

export default memo(ShowcaseCard)
