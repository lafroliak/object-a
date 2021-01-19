import { memo } from 'react'

import { Option } from '@typings/utils'
import { Product } from '@lib/crystallize/types'

import CollapsableImage from './CollapsableImage'

type Props = {
  item: Option<Product>
}
function ProductImage({ item }: Props) {
  const variant = item?.variants ? item.variants.find((v) => v.isDefault) : item?.defaultVariant
  const images = variant?.images

  const image = images?.[0].variants?.find((img) => img.width === 500 && !img.url.includes('webp'))

  if (!image?.url) return null

  return <CollapsableImage image={image.url} />
}

export default memo(ProductImage)
