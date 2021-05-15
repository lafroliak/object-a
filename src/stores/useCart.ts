import { nanoid } from 'nanoid'
import create from 'zustand'
import { persist } from 'zustand/middleware'

import { Product } from '~lib/crystallize/types'
import { Customer } from '~lib/crystallize/types-orders'
import { Option } from '~typings/utils'

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
   * `items` – Items in the Cart
   */
  items: Array<Product>
  clearItems: () => void
  addItem: (item: Product) => void
  deleteItem: (itemID: string) => void
  totals: () => {
    gross: number
    net: number
    quantity: number
    currency: string
  }
  customer: Option<Customer>
  updateCustomer: (customer: Customer) => void
}

export default create<State>(
  persist(
    (set, get) => ({
      session: null,
      clearSession: () => set({ session: null }, true),
      setSession: (session) => set({ session: session ?? nanoid() }),

      items: [],
      clearItems: () => set({ items: [] }, true),
      addItem: (item) =>
        set({
          items: get().items.find(
            (itm) =>
              itm?.variants?.[0].id === item.variants?.[0].id ||
              itm?.id === item?.id,
          )
            ? get().items
            : [...get().items, item],
        }),
      deleteItem: (itemID) =>
        set({ items: get().items.filter((item) => item.id !== itemID) }),
      totals: () =>
        get().items.reduce(
          (acc, curr) => {
            const quantity = 1
            const variant = curr.variants
              ? curr.variants.find((v) => v.isDefault)
              : curr.defaultVariant
            const priceVariants = variant?.priceVariants
            const { price, currency } =
              priceVariants?.find((pv) => pv.identifier === 'default') || {}
            if (price) {
              acc.gross += price * 1
              acc.net += price * quantity
              acc.currency = currency || 'usd'
            }
            acc.quantity += quantity
            return acc
          },
          { gross: 0, net: 0, quantity: 0, currency: 'usd' },
        ),
      customer: null,
      updateCustomer: (customer: Customer) => set({ customer }),
    }),
    {
      name: 'cart',
      getStorage: () =>
        typeof window !== 'undefined' ? window.localStorage : dummyStorageApi,
    },
  ),
)
