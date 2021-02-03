import CrystallizeContentTransformer from '@crystallize/content-transformer/react'
import { RichTextContent } from '@lib/crystallize/types'
import { memo } from 'react'

const commonTransfomerOverrides = {
  link({ metadata, renderNode, ...rest }: any) {
    const { href } = metadata

    return <a href={href}>{renderNode(rest)}</a>
  },
}

type Props = {
  content: RichTextContent['json']
}

function CrystallizeContent({ content }: Props) {
  return <CrystallizeContentTransformer {...content} overrides={commonTransfomerOverrides} />
}

export default memo(CrystallizeContent)
