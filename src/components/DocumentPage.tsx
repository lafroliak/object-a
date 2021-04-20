import {
  Item,
  ParagraphCollectionContent,
  PropertiesTableContent,
  RichTextContent,
} from '~lib/crystallize/types'

import CrystallizeContent from './CrystallizeContent'
import IfElse from './IfElse'

type Props = {
  page: Item
}

export default function DocumentPage({ page }: Props) {
  return (
    <div className="w-full min-h-full p-8 mx-auto space-y-6 text-sm bg-color-100 dark:bg-color-800 max-w-prose">
      <IfElse predicate={page.name}>
        {(name) => <h1 className="text-base">{name}</h1>}
      </IfElse>
      <IfElse predicate={page.components?.find((c) => c?.name === 'Intro')}>
        {(component) => (
          <IfElse
            predicate={
              component?.type === 'richText'
                ? (component?.content as RichTextContent)
                : null
            }
          >
            {(content) => <CrystallizeContent content={content.json} />}
          </IfElse>
        )}
      </IfElse>
      <IfElse predicate={page.components?.find((c) => c?.name === 'Body')}>
        {({ content }) => (
          <IfElse
            predicate={(content as ParagraphCollectionContent)?.paragraphs}
          >
            {(paragraphs) => (
              <>
                {paragraphs.map(({ body }, idx) => (
                  <IfElse
                    key={`paragraphs-${idx}`}
                    predicate={body as RichTextContent}
                  >
                    {(content) => <CrystallizeContent content={content.json} />}
                  </IfElse>
                ))}
              </>
            )}
          </IfElse>
        )}
      </IfElse>
      <IfElse predicate={page.components?.find((c) => c?.name === 'Sizes')}>
        {(component) => (
          <IfElse
            predicate={
              component?.type === 'propertiesTable'
                ? (component?.content as PropertiesTableContent)
                : null
            }
          >
            {(content) =>
              content?.sections?.find((s) =>
                s?.properties?.find((p) => p?.value),
              ) ? (
                <table className="text-xs text-center">
                  <thead className="border-b border-color-500">
                    <td className="px-2 pb-1">EU SIZE</td>
                    {content.sections?.[0]?.properties?.map((prop) => (
                      <td key={prop.key} className="px-2 pb-1">
                        {prop.key}
                      </td>
                    ))}
                  </thead>
                  <tbody>
                    {content.sections?.map((sec) => (
                      <tr className="pt-1" key={sec.title}>
                        <td>{sec.title}</td>
                        {sec.properties?.map((prop) => (
                          <td className="pt-1" key={`${sec.title}-${prop.key}`}>
                            {prop.value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null
            }
          </IfElse>
        )}
      </IfElse>
    </div>
  )
}
