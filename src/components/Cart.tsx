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
  const deleteItem = useCart((state) => state.deleteItem)

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
              <div
                key={`showcase-${item.id}-${idx}`}
                className="flex flex-col items-center w-full space-y-2"
              >
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
                  <a className="block w-96">
                    <ShowcaseCard item={item} isLink withProducts withSize />
                  </a>
                </Link>
                <div className="text-xs">
                  <span className="font-semibold">
                    ${item.variants?.[0].priceVariants?.[0]?.price}{' '}
                  </span>
                  <button
                    type="button"
                    className="uppercase cursor-pointer focus:outline-none"
                    onClick={() => deleteItem(item.variants?.[0]?.sku)}
                  >
                    [remove from cart]
                  </button>
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <div className="pb-1 text-xs font-semibold border-b border-red-500/50">
                {'Total'}
              </div>
              <div className="text-sm">
                {totals().quantity}
                {' item / Total '}
                {totals().net} {totals().currency?.toUpperCase()}
              </div>
            </div>
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
