import {
  ContentTransformer,
  NodeContent,
  NodeProps,
} from '@crystallize/react-content-transformer'
import { memo } from 'react'

import { RichTextContent } from '~lib/crystallize/types'

const overrides = {
  p: function Paragraph(props: NodeProps) {
    return <p className="text-capsize" {...props} />
  },
  link: function Link(props: NodeProps) {
    return (
      <a href={props.metadata?.href}>
        <NodeContent {...props} />
      </a>
    )
  },
}

type Props = {
  content: RichTextContent['json']
}

function CrystallizeContent({ content }: Props) {
  if (!content) return null

  return <ContentTransformer json={content} overrides={overrides} />
}

export default memo(CrystallizeContent)
