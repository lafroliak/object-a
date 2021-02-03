import useBasket from '@stores/useBasket'
import useDrawer from '@stores/useDrawer'

import { SIDES } from './Drawers'

export default function BasketButton() {
  const items = useBasket((state) => state.items)
  const toggle = useDrawer((state) => state.toggle)

  return (
    <button
      type="button"
      className="cursor-pointer focus:outline-none"
      onClick={() => toggle(SIDES.Right)}
    >
      [{items.length}]
    </button>
  )
}
