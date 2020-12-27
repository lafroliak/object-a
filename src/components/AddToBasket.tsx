import { memo } from 'react'

import { Item } from '@lib/crystallize/types'
import useBasket from '@stores/useBasket'
import type { Option } from '@typings/utils'

type Props = {
  item: Option<Item>
}
function AddToBasket({ item }: Props) {
  const items = useBasket((state) => state.items)
  const addItem = useBasket((state) => state.addItem)
  const deleteItem = useBasket((state) => state.deleteItem)
  const buyNow = useBasket((state) => state.buyNow)
  const isItemInBasket = items.find((i) => i.id === item?.id)

  const handleClick = () => {
    if (!item) return

    if (isItemInBasket) {
      deleteItem(item.id)
    } else {
      addItem(item)
    }
  }

  const handleNow = () => {
    if (!item) return

    buyNow(item)
  }

  return (
    <div className="space-x-8">
      <button type="button" onClick={handleClick}>
        {isItemInBasket ? 'Remove from Basket' : 'Add to Basket'}
      </button>
      <button type="button" onClick={handleNow}>
        Buy Now
      </button>
    </div>
  )
}

export default memo(AddToBasket)
