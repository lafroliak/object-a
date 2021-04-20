import { memo } from 'react'

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

  const handleClick = () => {
    if (!item) return

    if (isItemInCart) {
      deleteItem(item.id)
    } else {
      addItem({
        ...item,
        variants: item.variants?.filter((v) => v?.sku == sku),
      })
    }
  }

  const handleNow = () => {
    if (!item) return

    addItem({ ...item, variants: item.variants?.filter((v) => v?.sku == sku) })
    open(SIDES.Right)
  }

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
