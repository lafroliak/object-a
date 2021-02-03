import 'tailwindcss/tailwind.css'
import '@styles/global.css'

import useBasket from '@stores/useBasket'
import { AnimatePresence } from 'framer-motion'
import { AppProps } from 'next/app'
import { ReactNode } from 'react'
import { useEffectOnce } from 'react-use'

function App({
  Component,
  pageProps,
  router,
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

  return getLayout(
    <AnimatePresence initial={false} exitBeforeEnter>
      <Component {...pageProps} key={router.pathname} />
    </AnimatePresence>,
  )
}

export default App
