import { Product } from '@lib/crystallize/types'
import { Option } from '@typings/utils'
import Image from 'next/image'
import { memo } from 'react'

import IfElse from './IfElse'

type Props = {
  item: Option<Product>
}

function ShowcaseCard({ item }: Props) {
  if (!item) return null

  const { name, type, variants, defaultVariant } = item
  if (type === 'folder' || type === 'document') return null

  const variant = variants ? variants.find((v) => v.isDefault) : defaultVariant
  const images = variant?.images

  const image = (images?.[0] || variant?.image)?.variants?.find(
    (img) => img.width === 500 && !img.url.includes('webp'),
  )

  return (
    <>
      <IfElse predicate={image}>
        {(prop) => (
          <picture className="relative flex-1 block w-full h-full aspect-w-1 aspect-h-1">
            <div className="absolute inset-0 grid overflow-hidden place-items-center">
              <Image
                src={prop.url}
                alt={`objekt ${item?.name || ''}`}
                width={prop.width}
                height={prop.height || prop.width}
              />
            </div>
          </picture>
        )}
      </IfElse>
      <IfElse predicate={name}>
        {(prop) => (
          <h3 className="text-center">[objekt {prop.toLocaleLowerCase()}]</h3>
        )}
      </IfElse>
    </>
  )
}

export default memo(ShowcaseCard)
