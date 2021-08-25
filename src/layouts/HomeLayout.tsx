import clsx from 'clsx'
import { PropsWithChildren, ReactNode } from 'react'
import { getLayout as getMainLayout } from './MainLayout'
import * as styles from './MainLayout.module.css'

const HomeLayout = ({ children }: PropsWithChildren<unknown>) => (
  <main
    className={clsx(
      'relative max-h-[calc(100vh-5rem)] md:max-h-[calc(100vh-6rem)] bg-color-200 overflow-y-auto md:overflow-x-hidden scrollzone dark:bg-color-900',
      styles.main,
    )}
  >
    {children}
  </main>
)

export const getLayout = (page: ReactNode) =>
  getMainLayout(<HomeLayout>{page}</HomeLayout>)

export default HomeLayout
