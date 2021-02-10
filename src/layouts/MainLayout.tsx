import Drawers from '@components/Drawers'
import { PropsWithChildren, ReactNode } from 'react'

function MainLayout({ children }: PropsWithChildren<unknown>) {
  return (
    <div>
      <Drawers />
      {children}
    </div>
  )
}

export const getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>

export default MainLayout
