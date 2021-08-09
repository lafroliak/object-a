import Link from 'next/link'
import { memo } from 'react'

import { GridColumn } from '~lib/crystallize/types'
import IfElse from './IfElse'

import ModelsCard from './ModelsCard'
import ProductCard from './ProductCard'

type Props = {
  columns: GridColumn[]
  isModelsList: boolean
}
function Products({ columns, isModelsList }: Props) {
  if (isModelsList) {
    return (
      <div className="mx-auto space-x-8 flex flex-row flex-nowrap max-w-[100%] overflow-scroll scrollzone">
        {(columns || []).map((c, i) => (
          <IfElse key={`models-${c.itemId}-${i}`} predicate={c.item}>
            {(item) => (
              <Link
                href={
                  item?.path
                    ? {
                        pathname: '/catalogue/[...catalogue]',
                        query: {
                          catalogue: decodeURIComponent(item.path).replace(
                            /^\//,
                            '',
                          ),
                        },
                      }
                    : '/'
                }
              >
                <a className="flex flex-col flex-shrink-0 h-full space-y-2 w-96 lg:w-[32rem]">
                  <ModelsCard item={item} />
                </a>
              </Link>
            )}
          </IfElse>
        ))}
      </div>
    )
  }
  return (
    <div className="max-w-5xl mx-auto space-y-8 md:-space-y-8">
      {(columns || []).map((c, i) => (
        <Link
          key={`products-${c.itemId}-${i}`}
          href={
            c.item?.path
              ? {
                  pathname: '/catalogue/[...catalogue]',
                  query: {
                    catalogue: decodeURIComponent(c.item.path).replace(
                      /^\//,
                      '',
                    ),
                  },
                }
              : '/'
          }
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
