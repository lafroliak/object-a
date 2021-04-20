import { trpc } from '~lib/trpc'

import DocumentPage from './DocumentPage'

export default function About() {
  const { data: page } = trpc.useQuery([
    'crystallize.get-page',
    { path: '/about' },
  ])

  if (!page) {
    return null
  }

  return <DocumentPage page={page} />
}
