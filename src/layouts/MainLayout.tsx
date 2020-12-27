import { PropsWithChildren, ReactNode } from 'react'

import Header from '@components/Header'
import BasketDrawer from '@components/BasketDrawer'

function MainLayout({ children }: PropsWithChildren<unknown>) {
  return (
    <>
      <Header />
      <main className="p-4">{children}</main>
      <BasketDrawer />
    </>
  )
}

export const getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>

export default MainLayout
