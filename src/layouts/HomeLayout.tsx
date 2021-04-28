import { PropsWithChildren, ReactNode } from 'react'

import { getLayout as getMainLayout } from './MainLayout'

const HomeLayout = ({ children }: PropsWithChildren<unknown>) => (
  <div className="py-12 space-y-12 md:py-24 md:space-y-24">{children}</div>
)

export const getLayout = (page: ReactNode) =>
  getMainLayout(<HomeLayout>{page}</HomeLayout>)

export default HomeLayout
