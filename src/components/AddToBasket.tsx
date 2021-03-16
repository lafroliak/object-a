import { Item } from '@lib/crystallize/types'
import useBasket from '@stores/useBasket'
import useDrawer from '@stores/useDrawer'
import type { Option } from '@typings/utils'
import { memo } from 'react'

import { SIDES } from './Drawers'

type Props = {
  item: Option<Item>
}
function AddToBasket({ item }: Props) {
  const items = useBasket((state) => state.items)
  const addItem = useBasket((state) => state.addItem)
  const deleteItem = useBasket((state) => state.deleteItem)
  const open = useDrawer((state) => state.open)
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

    addItem(item)
    open(SIDES.Right)
  }

  return (
    <div className="space-x-8">
      <button type="button" onClick={handleClick}>
        [{isItemInBasket ? 'remove from basket' : 'add to basket'}]
      </button>
      <button type="button" onClick={handleNow}>
        [buy now]
      </button>
    </div>
  )
}

export default memo(AddToBasket)
