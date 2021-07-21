import 'tailwindcss/tailwind.css'
import '~styles/global.css'

import { httpLink } from '@trpc/client/links/httpLink'
import { loggerLink } from '@trpc/client/links/loggerLink'
import { withTRPC } from '@trpc/next'
import type { AppProps } from 'next/app'
import getConfig from 'next/config'
import { DefaultSeo } from 'next-seo'
import { ReactNode } from 'react'
import { useEffectOnce } from 'react-use'
import superjson from 'superjson'

import useCart from '~stores/useCart'

import { AppRouter } from './api/trpc/[trpc]'

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

  return (
    <>
      <DefaultSeo
        title={publicRuntimeConfig.SITE_NAME}
        canonical={publicRuntimeConfig.SITE_URL}
        openGraph={{
          type: 'website',
          locale: 'en_IE',
          url: publicRuntimeConfig.SITE_URL,
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
      {getLayout(<Component {...pageProps} />)}
    </>
  )
}

function getBaseUrl() {
  if (process.browser) {
    return ''
  }
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export default withTRPC<AppRouter>({
  config() {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    return {
      /**
       * @link https://trpc.io/docs/links
       */
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      /**
       * @link https://trpc.io/docs/data-transformers
       */
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      queryClientConfig: {
        defaultOptions: {
          queries: { staleTime: 1000 * 60, refetchOnWindowFocus: true },
        },
      },
    }
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp)
