import clsx from 'clsx'
import getConfig from 'next/config'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import { PropsWithChildren, ReactNode, useEffect, useRef } from 'react'

import Header from '~components/Header'
import TailwindCSS from '~components/TailwindCSS'

import * as styles from './MainLayout.module.css'

const Drawers = dynamic(import('~components/Drawers'), {
  loading: function Placeholder() {
    return <p>[loading...]</p>
  },
  ssr: false,
})

const { publicRuntimeConfig } = getConfig()

function MainLayout({ children }: PropsWithChildren<unknown>) {
  const main = useRef<HTMLElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (main.current) {
      main.current.scrollTop = 0
    }
  }, [router.asPath])

  return (
    <>
      <div
        className={clsx(
          'grid content-between h-full min-h-screen w-screen max-w-full max-h-screen overflow-hidden',
          styles['main-container'],
        )}
      >
        <h1 className={clsx('grid place-items-center opacity-0', styles.hide)}>
          {publicRuntimeConfig.SITE_NAME}
        </h1>
        <main
          ref={main}
          className={clsx(
            'relative max-h-[calc(100vh-5rem)] md:max-h-[calc(100vh-6rem)] bg-color-200 overflow-y-auto md:overflow-x-hidden scrollzone dark:bg-color-900',
            styles.main,
          )}
        >
          {children}
        </main>
      </div>
      <Drawers />
      <Header />
      <TailwindCSS />
    </>
  )
}

export const getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>

export default MainLayout
