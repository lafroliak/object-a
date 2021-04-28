import { trpc } from '~lib/trpc'

import DocumentPage from './DocumentPage'

export default function PageContent({ path }: { path: string }) {
  const { data: page } = trpc.useQuery(['crystallize.get-page', { path }])

  if (!page) {
    return null
  }

  return <DocumentPage page={page} />
}
