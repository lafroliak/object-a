import { Sides } from '@components/Drawers'
import { Option } from '@typings/utils'
import create from 'zustand'

type State = {
  opened: Option<Sides>
  toggle: (side: Sides) => void
  open: (side: Sides) => void
  close: () => void
}

export default create<State>((set, get) => ({
  opened: undefined,
  toggle: (side: Sides) =>
    set({ opened: get().opened === side ? undefined : side }),
  open: (side: Sides) => set({ opened: side }),
  close: () => set({ opened: undefined }),
}))
