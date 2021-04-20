import { memo } from 'react'

import { Item, RichTextContent } from '~lib/crystallize/types'
import { Option } from '~typings/utils'

import CrystallizeContent from './CrystallizeContent'
import IfElse from './IfElse'

type Props = {
  item: Option<Item>
}
function Intro({ item }: Props) {
  if (!item) return null

  const { type, components } = item
  const text = components?.find((x) => x?.name === 'Intro')

  if (type === 'folder' || type === 'product' || !text) return null

  return (
    <IfElse predicate={text?.content as RichTextContent}>
      {(prop) => (
        <div className="max-w-3xl mx-auto">
          <CrystallizeContent content={prop.json} />
        </div>
      )}
    </IfElse>
  )
}

export default memo(Intro)
