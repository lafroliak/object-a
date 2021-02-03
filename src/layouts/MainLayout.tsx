import Drawers from '@components/Drawers'
import { PropsWithChildren, ReactNode } from 'react'

import * as styles from './MainLayout.module.css'

function MainLayout({ children }: PropsWithChildren<unknown>) {
  return (
    <>
      <Drawers />
      <div className={styles['main-container']}>
        <main className={styles.main}>{children}</main>
      </div>
    </>
  )
}

export const getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>

export default MainLayout
