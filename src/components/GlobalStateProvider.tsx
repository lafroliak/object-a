import { Item, Maybe, Product } from '@lib/crystallize/types'
import { trpc } from '@lib/trpc'
import { createContext, ReactNode, useContext } from 'react'

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

type Props = {
  children: ReactNode
  state: State
}

export default function GlobalStateProvider({ children, state }: Props) {
  const { data: pagesData } = trpc.useQuery(['crystallize.get-all-pages'], {
    initialData: { pages: state.pages, lastUpdated: new Date().toJSON() },
  })
  const { data: productsData } = trpc.useQuery(
    ['crystallize.get-all-products'],
    {
      initialData: {
        products: state.products,
        lastUpdated: new Date().toJSON(),
      },
    },
  )

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
