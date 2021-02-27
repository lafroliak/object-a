import Header from '@components/Header'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { PropsWithChildren, ReactNode } from 'react'

import * as styles from './MainLayout.module.css'

const Drawers = dynamic(import('@components/Drawers'), {
  loading: function Placeholder() {
    return <p>[loading...]</p>
  },
  ssr: false,
})

function MainLayout({ children }: PropsWithChildren<unknown>) {
  return (
    <>
      <div
        className={clsx(
          'grid content-between h-full min-h-screen w-screen',
          styles['main-container'],
        )}
      >
        <main className={clsx('relative bg-gray-200', styles.main)}>
          {children}
        </main>
      </div>
      <Drawers />
      <Header />
    </>
  )
}

export const getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>

export default MainLayout
