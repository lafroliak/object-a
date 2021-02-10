import clsx from 'clsx'
import { PropsWithChildren, ReactNode } from 'react'

import * as styles from './HomeLayout.module.css'
import { getLayout as getMainLayout } from './MainLayout'

const CatalogueLayout = ({ children }: PropsWithChildren<unknown>) => (
  <div
    className={clsx(
      'grid content-between h-full min-h-screen max-h-screen w-screen',
      styles['main-container'],
    )}
  >
    <main
      className={clsx(
        'relative bg-gray-200 overflow-y-auto border-gray-400 border border-solid',
        styles.main,
      )}
    >
      {children}
    </main>
  </div>
)

export const getLayout = (page: ReactNode) =>
  getMainLayout(<CatalogueLayout>{page}</CatalogueLayout>)

export default CatalogueLayout
