import { GridRelationsContent, Item } from '@lib/crystallize/types'
import { Option } from '@typings/utils'
import Link from 'next/link'
import { memo } from 'react'

import IfElse from './IfElse'
import ProductCard from './ProductCard'

type Props = {
  item: Option<Item>
  row?: number
}
function Products({ item, row = 0 }: Props) {
  if (!item) return null

  const { type, components } = item
  const body = components?.find((x) => x?.name === 'Products')

  if (type === 'folder' || type === 'product' || !body) return null

  return (
    <IfElse predicate={body?.content as GridRelationsContent}>
      {(prop) => (
        <div className="max-w-5xl mx-auto space-y-12 md:-space-y-32">
          {(prop.grids?.[0]?.rows?.[row]?.columns || []).map((c, i) => (
            <Link
              key={c.itemId}
              href={c.item?.path ? `/catalogue${c.item.path}` : '/'}
            >
              <a className="block w-full">
                <ProductCard item={c.item} index={i} />
              </a>
            </Link>
          ))}
        </div>
      )}
    </IfElse>
  )
}

export default memo(Products)
