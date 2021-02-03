import useDrawer from '@stores/useDrawer'

import { SIDES } from './Drawers'

export default function MenuButton() {
  const toggle = useDrawer((state) => state.toggle)
  const opened = useDrawer((state) => state.opened)

  return (
    <button
      type="button"
      className="cursor-pointer focus:outline-none"
      onClick={() => toggle(SIDES.Top)}
    >
      [{opened === SIDES.Top ? '×' : '≡'}]
    </button>
  )
}
