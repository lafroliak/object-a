import { PropsWithChildren, ReactNode } from 'react'

import { getLayout as getMainLayout } from './MainLayout'

const HomeLayout = ({ children }: PropsWithChildren<unknown>) => <>{children}</>

export const getLayout = (page: ReactNode) =>
  getMainLayout(<HomeLayout>{page}</HomeLayout>)

export default HomeLayout
