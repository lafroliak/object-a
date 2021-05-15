import useCart from '~stores/useCart'
import useDrawer from '~stores/useDrawer'

import { SIDES } from './Drawers'

export default function CartButton() {
  const items = useCart((state) => state.items)
  const toggle = useDrawer((state) => state.toggle)

  return (
    <button
      type="button"
      className="cursor-pointer focus:outline-none"
      onClick={() => toggle(SIDES.Right)}
    >
      [{items.length ?? 0}]
    </button>
  )
}
