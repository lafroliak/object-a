import create from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

import { Product } from '@lib/crystallize/types'
import { Option } from '@typings/utils'

const dummyStorageApi = {
  getItem: () => null,
  setItem: () => undefined,
}

type State = {
  /**
   * `session` – Set session ID and store it in the SessionStorage
   */
  session: string | null
  clearSession: () => void
  setSession: (session?: string) => void

  /**
   * `items` – Items in the Basket
   */
  items: Array<Product>
  clearItems: () => void
  addItem: (item: Product) => void
  deleteItem: (itemID: string) => void
  buyNow: (item: Product) => void
  totals: () => { gross: number; net: number; quantity: number; currency: Option<string> }

  /**
   * `opened` – Opened/Closed basket panels
   */
  opened: boolean
  toggle: () => void
  close: () => void
}

export default create<State>(
  persist(
    (set, get) => ({
      session: null,
      clearSession: () => set({ session: null }, true),
      setSession: (session) => set({ session: session ?? nanoid() }),

      items: [],
      clearItems: () => set({ items: [] }, true),
      addItem: (item) => set({ items: [...get().items, item] }),
      deleteItem: (itemID) => set({ items: get().items.filter((item) => item.id !== itemID) }),
      buyNow: (item) => set({ items: [item], opened: true }),
      totals: () =>
        get().items.reduce(
          (acc, curr) => {
            const quantity = 1
            const variant = curr.variants ? curr.variants.find((v) => v.isDefault) : curr.defaultVariant
            const priceVariants = variant?.priceVariants
            const { price, currency } = priceVariants?.find((pv) => pv.identifier === 'default') || {}
            if (price) {
              acc.gross += price * 1
              acc.net += price * quantity
              acc.currency = currency
            }
            acc.quantity += quantity
            return acc
          },
          { gross: 0, net: 0, quantity: 0, currency: null as Option<string> },
        ),

      opened: false,
      toggle: () => set({ opened: !get().opened }),
      close: () => set({ opened: false }),
    }),
    {
      name: 'basket',
      storage: typeof window !== 'undefined' ? window.sessionStorage : dummyStorageApi,
    },
  ),
)
