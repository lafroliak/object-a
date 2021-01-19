import { memo } from 'react'

import { Product } from '@lib/crystallize/types'
import { Option } from '@typings/utils'

import IfElse from './IfElse'
import ProductImage from './ProductImage'

type Props = {
  item: Option<Product>
}
function ProductCard({ item }: Props) {
  if (!item) return null

  const { name, type, variants, defaultVariant } = item
  if (type === 'folder' || type === 'document') return null

  const variant = variants ? variants.find((v) => v.isDefault) : defaultVariant
  const priceVariants = variant?.priceVariants

  const { price, currency } = priceVariants?.find((pv) => pv.identifier === 'default') || {}

  return (
    <div>
      <IfElse predicate={item}>{(prop) => <ProductImage item={prop} />}</IfElse>
      <IfElse predicate={name}>{(prop) => <h3>{prop}</h3>}</IfElse>
      <IfElse predicate={{ price, currency }}>{(prop) => <div>{`${prop.price} ${prop.currency}`}</div>}</IfElse>
    </div>
  )
}

export default memo(ProductCard)
