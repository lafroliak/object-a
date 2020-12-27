import { ReactNode } from 'react'
import { AppProps } from 'next/app'
import { useEffectOnce } from 'react-use'

import useBasket from '@stores/useBasket'
import '@styles/tailwind.css'

function App({
  Component,
  pageProps,
}: AppProps & {
  Component: AppProps['Component'] & {
    getLayout: ((comp: ReactNode) => ReactNode) | undefined
  }
}) {
  const getLayout = Component.getLayout || ((page: ReactNode) => page)

  const setSession = useBasket((state) => state.setSession)

  useEffectOnce(() => {
    setSession()
  })

  return getLayout(<Component {...pageProps} />)
}

export default App
