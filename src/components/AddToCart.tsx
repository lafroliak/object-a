import { memo, useCallback } from 'react'

import { Product } from '~lib/crystallize/types'
import useCart from '~stores/useCart'
import type { Option } from '~typings/utils'

type Props = {
  item: Option<Product>
  sku: Option<string>
}
function AddToCart({ item, sku }: Props) {
  const items = useCart((state) => state.items)
  const addItem = useCart((state) => state.addItem)
  const deleteItem = useCart((state) => state.deleteItem)
  // const open = useDrawer((state) => state.open)
  const isItemInCart = items.some((i) => i.variants?.some((v) => v?.sku == sku))

  const handleClick = useCallback(() => {
    if (!item || !sku) return

    if (isItemInCart) {
      deleteItem(sku)
    } else {
      if (!item || typeof addItem !== 'function') return

      addItem({
        ...item,
        variants: item.variants?.filter((v) => v?.sku == sku),
      })
    }
  }, [item, addItem, deleteItem, sku, isItemInCart])

  // const handleNow = useCallback(() => {
  //   if (!item || typeof addItem !== 'function') return

  //   addItem({ ...item, variants: item.variants?.filter((v) => v?.sku == sku) })
  //   open(SIDES.Right)
  // }, [item, addItem, open, sku])

  // TODO size!!

  return (
    <div className="space-x-8">
      <button
        type="button"
        onClick={handleClick}
        className="inline-block text-lg uppercase md:transition-colors md:ease-in-out md:delay-100 md:text-color-900/0 md:dark:text-color-100/0 md:bg-clip-text md:bg-gradient-to-r md:from-color-900 md:dark:from-color-100 md:hover:from-rose-500 md:to-color-900 md:dark:to-color-100 md:hover:to-cyan-500"
      >
        [{isItemInCart ? 'remove from cart' : 'add to cart'}]
      </button>
      {/* <button
        type="button"
        onClick={handleNow}
        className="inline-block uppercase"
      >
        [buy now]
      </button> */}
    </div>
  )
}

export default memo(AddToCart)
