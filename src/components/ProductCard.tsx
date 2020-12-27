import { memo } from 'react'

import { Product } from '@lib/crystallize/types'
import IfElse from './IfElse'

type Props = {
  item: Product
}
function ProductCard({ item }: Props) {
  const { name, type, variants, defaultVariant } = item
  if (type === 'folder' || type === 'document') return null

  const variant = variants ? variants.find((v) => v.isDefault) : defaultVariant
  const priceVariants = variant?.priceVariants
  const images = variant?.images

  const { price, currency } = priceVariants?.find((pv) => pv.identifier === 'default') || {}
  const image = images?.[0].variants?.find((img) => img.width === 500)

  return (
    <div>
      <IfElse predicate={image}>
        {(prop) => (
          <img
            src={prop.url}
            width={prop.width}
            height={prop.width * 0.66666}
            alt={images?.[0].altText || name || ''}
          />
        )}
      </IfElse>
      <IfElse predicate={name}>{(prop) => <h3>{prop}</h3>}</IfElse>
      <IfElse predicate={{ price, currency }}>{(prop) => <div>{`${prop.price} ${prop.currency}`}</div>}</IfElse>
    </div>
  )
}

export default memo(ProductCard)
