import { trpc } from '@lib/trpc'
import clsx from 'clsx'
import Link from 'next/link'
import { memo } from 'react'

import * as styles from './Showcase.module.css'
import ShowcaseCard from './ShowcaseCard'

function Showcase() {
  const allProducts = trpc.useQuery(['crystallize.get-all-products'])

  return (
    <div
      className={clsx(
        'flex flex-row w-full h-full px-4 pb-4 space-x-8 overflow-x-auto overflow-y-hidden flex-nowrap',
        styles.showcase,
      )}
    >
      {allProducts.data?.map((item) => (
        <Link
          key={`showcase-${item.id}`}
          href={item?.path ? `/catalogue${item.path}` : '/'}
        >
          <a className="flex flex-col flex-shrink-0 w-64 h-full space-y-2">
            <ShowcaseCard item={item} />
          </a>
        </Link>
      ))}
    </div>
  )
}

export default memo(Showcase)
