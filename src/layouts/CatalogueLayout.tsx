import { PropsWithChildren, ReactNode } from 'react'

import { getLayout as getMainLayout } from './MainLayout'

const CatalogueLayout = ({ children }: PropsWithChildren<unknown>) => (
  <>{children}</>
)

export const getLayout = (page: ReactNode) =>
  getMainLayout(<CatalogueLayout>{page}</CatalogueLayout>)

export default CatalogueLayout
