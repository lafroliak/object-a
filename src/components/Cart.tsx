import clsx from 'clsx'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { memo } from 'react'

import useCart from '~stores/useCart'
import useDrawer from '~stores/useDrawer'

import IfElse from './IfElse'
import * as styles from './Showcase.module.css'
import ShowcaseCard from './ShowcaseCard'
import StripeWrapper from './StripeWrapper'

const Payment = dynamic(import('./Payment'), { ssr: false })

function Cart() {
  const opened = useDrawer((state) => state.opened)
  const items = useCart((state) => state.items)
  const totals = useCart((state) => state.totals)
  const clearItems = useCart((state) => state.clearItems)

  return (
    <motion.div
      className={clsx(
        'p-4 pb-28 space-y-10 max-h-screen text-sm overflow-y-auto overflow-x-hidden',
        styles.showcase,
      )}
      animate={{ opacity: !!opened ? 1 : 0 }}
    >
      <IfElse
        predicate={items.length > 0 ? items : null}
        placeholder={
          <div className="grid w-full h-full text-sm place-items-center">
            Cart is empty
          </div>
        }
      >
        {(itms) => (
          <>
            {itms.map((item, idx) => (
              <div key={item.id} className="w-full space-y-2">
                <Link
                  key={`showcase-${item.id}-${idx}`}
                  href={item?.path ? `/catalogue${item.path}` : '/'}
                >
                  <a>
                    <ShowcaseCard item={item} isLink />
                  </a>
                </Link>
                <div className="text-center">
                  ${item.variants?.[0].priceVariants?.[0]?.price}
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <div className="pb-1 text-xs border-b border-color-500">
                {'Total'}
              </div>
              <div className="text-sm">
                {totals().quantity}
                {' item(s) for '}
                {totals().net} {totals().currency?.toUpperCase()}
              </div>
            </div>
            <IfElse predicate={totals().quantity > 0}>
              {() => (
                <>
                  <button
                    type="button"
                    className="uppercase cursor-pointer focus:outline-none"
                    onClick={clearItems}
                  >
                    [clean cart]
                  </button>
                </>
              )}
            </IfElse>
            <StripeWrapper>
              <Payment />
            </StripeWrapper>
          </>
        )}
      </IfElse>
    </motion.div>
  )
}

export default memo(Cart)