import clsx from 'clsx'
import Link from 'next/link'
import { memo } from 'react'

import { useGlobalState } from './GlobalStateProvider'
import * as styles from './Showcase.module.css'
import ShowcaseCard from './ShowcaseCard'

function Showcase() {
  const { products } = useGlobalState()

  return (
    <div
      className={clsx(
        'flex flex-row w-full h-full px-4 pb-4 space-x-8 overflow-x-auto overflow-y-hidden flex-nowrap',
        styles.showcase,
      )}
    >
      {products?.map((item, idx) => (
        <Link
          key={`showcase-${item.id}-${idx}`}
          href={
            item?.path
              ? {
                  pathname: '/catalogue/[...catalogue]',
                  query: {
                    catalogue: decodeURIComponent(item.path).replace(/^\//, ''),
                  },
                }
              : '/'
          }
        >
          <a className="flex flex-col flex-shrink-0 w-64 h-full space-y-2">
            <ShowcaseCard item={item} isLink />
          </a>
        </Link>
      ))}
    </div>
  )
}

export default memo(Showcase)
