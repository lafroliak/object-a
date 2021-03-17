import 'tailwindcss/tailwind.css'
import '@styles/global.css'

import GlobalStateProvider, { State } from '@components/GlobalStateProvider'
import { getAllPages } from '@lib/crystallize/queries'
import { trpc } from '@lib/trpc'
import useBasket from '@stores/useBasket'
import { NextComponentType } from 'next'
import type { AppContext, AppProps } from 'next/app'
import getConfig from 'next/config'
import { DefaultSeo } from 'next-seo'
import { ReactNode } from 'react'
import { QueryClientProvider } from 'react-query'
import { Hydrate } from 'react-query/hydration'
import { useEffectOnce } from 'react-use'

const { publicRuntimeConfig } = getConfig()

export interface ModifiedAppInitialProps<A = { [key in string]: string }> {
  appProps: A
}

export interface ExtendedAppProps<
  P = { [key in string]: string },
  A = { [key in string]: string }
> extends AppProps<P>,
    ModifiedAppInitialProps<A> {}

const App: NextComponentType<
  AppContext,
  ModifiedAppInitialProps<{ state: State }>,
  ExtendedAppProps<unknown, { state: State }> & {
    Component: AppProps['Component'] & {
      getLayout: ((comp: ReactNode) => ReactNode) | undefined
    }
  }
> = ({ Component, pageProps, appProps }) => {
  const getLayout = Component.getLayout || ((page: ReactNode) => page)

  const setSession = useBasket((state) => state.setSession)

  useEffectOnce(() => {
    setSession()
  })

  return (
    <>
      <DefaultSeo
        title={publicRuntimeConfig.SITE_NAME}
        canonical={process.env.VERCEL_URL || publicRuntimeConfig.SITE_URL}
        openGraph={{
          type: 'website',
          locale: 'en_IE',
          url: process.env.VERCEL_URL || publicRuntimeConfig.SITE_URL,
          site_name: publicRuntimeConfig.SITE_NAME,
        }}
        twitter={{
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'twitter:image:alt',
            content: publicRuntimeConfig.SITE_NAME,
          },
        ]}
      />
      <QueryClientProvider client={trpc.queryClient}>
        <Hydrate state={trpc.useDehydratedState(pageProps?.dehydratedState)}>
          <GlobalStateProvider state={appProps.state}>
            {getLayout(<Component {...pageProps} />)}
          </GlobalStateProvider>
        </Hydrate>
      </QueryClientProvider>
    </>
  )
}

App.getInitialProps = async function getInitialProps() {
  const state: State = {
    pages: null,
  }

  try {
    state.pages = await getAllPages()
  } catch (error) {
    console.error('getInitialProps: ', error) // eslint-disable-line
  }

  return { appProps: { state } }
}

export default App
