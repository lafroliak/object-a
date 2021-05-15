import { memo, useCallback } from 'react'

import { Product } from '~lib/crystallize/types'
import useCart from '~stores/useCart'
import useDrawer from '~stores/useDrawer'
import type { Option } from '~typings/utils'

import { SIDES } from './Drawers'

type Props = {
  item: Option<Product>
  sku: Option<string>
}
function AddToCart({ item, sku }: Props) {
  const items = useCart((state) => state.items)
  const addItem = useCart((state) => state.addItem)
  const deleteItem = useCart((state) => state.deleteItem)
  const open = useDrawer((state) => state.open)
  const isItemInCart = items.find((i) => i.id === item?.id)

  const handleClick = useCallback(() => {
    if (!item) return

    if (isItemInCart) {
      deleteItem(item.id)
    } else {
      if (!item || typeof addItem !== 'function') return

      addItem({
        ...item,
        variants: item.variants?.filter((v) => v?.sku == sku),
      })
    }
  }, [item, addItem, deleteItem, sku, isItemInCart])

  const handleNow = useCallback(() => {
    if (!item || typeof addItem !== 'function') return

    addItem({ ...item, variants: item.variants?.filter((v) => v?.sku == sku) })
    open(SIDES.Right)
  }, [item, addItem, open, sku])

  return (
    <div className="space-x-8">
      <button
        type="button"
        onClick={handleClick}
        className="inline-block uppercase"
      >
        [{isItemInCart ? 'remove from cart' : 'add to cart'}]
      </button>
      <button
        type="button"
        onClick={handleNow}
        className="inline-block uppercase"
      >
        [buy now]
      </button>
    </div>
  )
}

export default memo(AddToCart)