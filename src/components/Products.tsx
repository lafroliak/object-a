import Link from 'next/link'
import { memo } from 'react'

import { GridColumn } from '~lib/crystallize/types'

import ProductCard from './ProductCard'

type Props = {
  columns: GridColumn[]
}
function Products({ columns }: Props) {
  return (
    <div className="max-w-5xl mx-auto space-y-8 md:-space-y-8">
      {(columns || []).map((c, i) => (
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
  )
}

export default memo(Products)
