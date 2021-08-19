import { omit } from './../lib/omit'
import { nanoid } from 'nanoid'
import create from 'zustand'
import { persist } from 'zustand/middleware'
import produce from 'immer'

import { Product } from '~lib/crystallize/types'
import { AddressType, Customer } from '~lib/crystallize/types-orders'
import { Option } from '~typings/utils'
import merge from '~lib/merge'

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
  deleteItem: (itemID?: string) => void
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
              itm?.id === item?.id &&
              itm?.variants?.[0].sku === item.variants?.[0].sku,
          )
            ? get().items
            : [...get().items, item],
        }),
      deleteItem: (sku) =>
        set({
          items: get().items.filter((item) => item?.variants?.[0].sku !== sku),
        }),
      totals: () =>
        get().items.reduce(
          (acc, curr) => {
            const quantity = 1
            const variant = curr.variants?.[0]
            const priceVariants = variant?.priceVariants
            const { price, currency } = priceVariants?.[0] || {}
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
      updateCustomer: (customer: Customer) =>
        set(
          produce<State>((state: State) => {
            if (!state.customer) {
              state.customer = {}
            }
            state.customer = merge(state.customer, omit(customer, 'addresses'))
            if (customer.addresses) {
              state.customer.addresses = [
                {
                  type: AddressType.Billing,
                  ...merge(
                    state.customer.addresses?.find(
                      (a) => a.type === AddressType.Billing,
                    ) || {},
                    customer.addresses.find(
                      (a) => a.type === AddressType.Billing,
                    ) || {},
                  ),
                },
                {
                  type: AddressType.Delivery,
                  ...merge(
                    state.customer.addresses?.find(
                      (a) => a.type === AddressType.Delivery,
                    ) || {},
                    customer.addresses.find(
                      (a) => a.type === AddressType.Delivery,
                    ) || {},
                  ),
                },
              ]
            }
          }),
        ),
    }),
    {
      name: 'cart',
      getStorage: () =>
        typeof window !== 'undefined' ? window.localStorage : dummyStorageApi,
    },
  ),
)
