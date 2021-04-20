import { memo } from 'react'

import { Item, ParagraphCollectionContent } from '~lib/crystallize/types'
import { Option } from '~typings/utils'

import CrystallizeContent from './CrystallizeContent'
import IfElse from './IfElse'

type Props = {
  item: Option<Item>
}
function Body({ item }: Props) {
  if (!item) return null

  const { type, components } = item
  const body = components?.find((x) => x?.name === 'Body')

  if (type === 'folder' || type === 'product' || !body) return null

  return (
    <IfElse predicate={body?.content as ParagraphCollectionContent}>
      {(prop) => (
        <div className="max-w-3xl mx-auto space-y-8">
          {(prop.paragraphs || []).map((p, idx) => (
            <CrystallizeContent key={idx} content={p.body?.json} />
          ))}
        </div>
      )}
    </IfElse>
  )
}

export default memo(Body)
