import PageContent from '~components/PageContent'
import { getLayout } from '~layouts/CatalogueLayout'

function CancelPage() {
  return (
    <section className="w-full min-h-full p-8 mx-auto space-y-6 text-sm bg-color-100 dark:bg-color-800 max-w-prose">
      <PageContent path="/cancel" />
    </section>
  )
}

CancelPage.getLayout = getLayout

export default CancelPage
