import { createContext, ReactNode, useContext } from 'react'

import {Option} from '@typings/utils'
import { trpc } from '@lib/trpc'
import { Item, Maybe } from '@lib/crystallize/types'

export type State = {
  pages: Maybe<Item[]>
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

  return (
    <GlobalStateContext.Provider
      value={{
        pages: pagesData?.pages || null,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  )
}
