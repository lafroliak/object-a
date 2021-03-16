import 'tailwindcss/tailwind.css'
import '@styles/global.css'

import { trpc } from '@lib/trpc'
import useBasket from '@stores/useBasket'
import { AppProps } from 'next/app'
import getConfig from 'next/config'
import { DefaultSeo } from 'next-seo'
import { ReactNode } from 'react'
import { QueryClientProvider } from 'react-query'
import { Hydrate } from 'react-query/hydration'
import { useEffectOnce } from 'react-use'

const { publicRuntimeConfig } = getConfig()

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
          <>{getLayout(<Component {...pageProps} />)}</>
        </Hydrate>
      </QueryClientProvider>
    </>
  )
}

export default App
