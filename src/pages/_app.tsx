import 'tailwindcss/tailwind.css'
import '~styles/global.css'

import type { AppProps } from 'next/app'
import getConfig from 'next/config'
import { DefaultSeo } from 'next-seo'
import { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Hydrate } from 'react-query/hydration'
import { useEffectOnce } from 'react-use'

import GlobalStateProvider from '~components/GlobalStateProvider'
import { trpc } from '~lib/trpc'
import useCart from '~stores/useCart'

const { publicRuntimeConfig } = getConfig()

function MyApp({
  Component,
  pageProps,
}: AppProps & {
  Component: AppProps['Component'] & {
    getLayout: ((comp: ReactNode) => ReactNode) | undefined
  }
}) {
  const getLayout = Component.getLayout || ((page: ReactNode) => page)

  const setSession = useCart((state) => state.setSession)

  useEffectOnce(() => {
    setSession()
  })

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            cacheTime: Infinity,
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            notifyOnChangeProps: 'tracked',
          },
        },
      }),
  )

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
      <QueryClientProvider client={queryClient}>
        <Hydrate state={trpc.useDehydratedState(pageProps?.dehydratedState)}>
          <GlobalStateProvider>
            {getLayout(<Component {...pageProps} />)}
          </GlobalStateProvider>
        </Hydrate>
      </QueryClientProvider>
    </>
  )
}

// MyApp.getInitialProps = async function getInitialProps() {
//   const ctx = await createContext()
//   const ssr = trpc.ssr(appRouter, ctx)

//   await ssr.prefetchQuery('crystallize.get-all-pages')
//   await ssr.prefetchQuery('crystallize.get-all-products')

//   return {
//     appProps: {
//       dehydratedState: ssr.dehydrate(),
//     },
//   }
// }

export default MyApp
