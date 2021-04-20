import { createContext, PropsWithChildren, useContext } from 'react'

import { Item, Maybe, Product } from '~lib/crystallize/types'
import { trpc } from '~lib/trpc'

export type State = {
  pages: Maybe<Partial<Item>[]>
  products: Maybe<Partial<Product>[]>
}

export const GlobalStateContext = createContext<State>({} as State)
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext)

  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider')
  }
  return context
}

export default function GlobalStateProvider({
  children,
}: PropsWithChildren<unknown>) {
  const { data: pagesData } = trpc.useQuery(['crystallize.get-all-pages'])
  const { data: productsData } = trpc.useQuery(['crystallize.get-all-products'])

  return (
    <GlobalStateContext.Provider
      value={{
        pages: pagesData?.pages || null,
        products: productsData?.products || null,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  )
}
