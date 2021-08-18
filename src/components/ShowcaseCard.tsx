import { memo } from 'react'

import { Product } from '~lib/crystallize/types'
import { isWebpSupported } from '~lib/isWebpSupported'
import { Option } from '~typings/utils'

import IfElse from './IfElse'

type Props = {
  item: Option<Partial<Product>>
  isLink?: boolean
}

function ShowcaseCard({ item, isLink }: Props) {
  if (!item) return null

  const { name, type, variants, defaultVariant } = item
  if (type === 'folder' || type === 'document') return null

  const images = defaultVariant?.images || variants?.[0]?.images

  const image = images?.[0]?.variants?.find(
    (img) =>
      img.width === 500 && img.url.includes(isWebpSupported() ? 'webp' : 'png'),
  )
  const isOutOfStock = variants?.every((v) => (v?.stock ?? 0) === 0)

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
          </h3>
        )}
      </IfElse>
    </>
  )
}

export default memo(ShowcaseCard)
