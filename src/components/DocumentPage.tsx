import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import {
  Item,
  ParagraphCollectionContent,
  PropertiesTableContent,
  RichTextContent,
  SingleLineContent,
} from '~lib/crystallize/types'

import CrystallizeContent from './CrystallizeContent'
import IfElse from './IfElse'

type Props = {
  page: Item
}

export default function DocumentPage({ page }: Props) {
  const { asPath } = useRouter()
  return (
    <>
      <NextSeo
        title={
          (
            page.components?.find((c) => c?.name === 'Title')
              ?.content as SingleLineContent
          )?.text || undefined
        }
        openGraph={{
          type: 'website',
          url: `${process.env.VERCEL_URL}/${asPath}`,
          title:
            (
              page.components?.find((c) => c?.name === 'Title')
                ?.content as SingleLineContent
            )?.text || undefined,
        }}
      />
      <IfElse
        predicate={
          (
            page.components?.find((c) => c?.name === 'Title')
              ?.content as SingleLineContent
          )?.text
        }
      >
        {(title) => <h1 className="text-base">{title}</h1>}
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
                <div className="w-full max-w-full overflow-x-auto scrollzone">
                  <table className="table text-xs text-center table-fixed">
                    <thead className="table-header-group border-b border-color-500">
                      <td className="px-2 pb-1">EU SIZE</td>
                      {content.sections?.[0]?.properties?.map((prop) => (
                        <td key={prop.key} className="px-2 pb-1">
                          {prop.key}
                        </td>
                      ))}
                    </thead>
                    <tbody className="table-row-group">
                      {content.sections?.map((sec) => (
                        <tr className="table-row pt-1" key={sec.title}>
                          <th>{sec.title}</th>
                          {sec.properties?.map((prop) => (
                            <td
                              className="pt-1"
                              key={`${sec.title}-${prop.key}`}
                            >
                              {prop.value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null
            }
          </IfElse>
        )}
      </IfElse>
    </>
  )
}
