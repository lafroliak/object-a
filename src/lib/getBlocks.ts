import { match } from 'ts-pattern'

import {
  ComponentType,
  GridRelationsContent,
  GridRow,
  ImageContent,
  Item,
  ParagraphCollectionContent,
  RichTextContent,
  SingleLineContent,
  Topic,
} from './crystallize/types'
import zip from './zip'

export type WithType<T, S extends ComponentType> = T & {
  type: S
}

export const getBlocks = (page: Item | undefined) => {
  const pageBlocks = page?.components?.reduce<{
    title: WithType<SingleLineContent, ComponentType.SingleLine> | null
    image: WithType<ImageContent, ComponentType.Images> | null
    intro: WithType<RichTextContent, ComponentType.RichText> | null
    productsGrid: Array<WithType<GridRow, ComponentType.GridRelations>> | null
    bodyBlocks: Array<
      WithType<RichTextContent, ComponentType.ParagraphCollection>
    > | null
    topics: Topic[] | null | undefined
  }>(
    (res, item) => {
      const result = res

      match(item)
        .with({ name: 'Title' }, (itm) => {
          result.title = {
            ...(itm.content as SingleLineContent),
            type: ComponentType.SingleLine,
          }
        })
        .with({ name: 'Image' }, (itm) => {
          result.image = {
            ...(itm.content as ImageContent),
            type: ComponentType.Images,
          }
        })
        .with({ name: 'Intro' }, (itm) => {
          result.intro = {
            ...(itm.content as RichTextContent),
            type: ComponentType.RichText,
          }
          result.bodyBlocks = [
            ...(result.bodyBlocks || []),
            {
              ...(itm.content as RichTextContent),
              type: ComponentType.ParagraphCollection,
            },
          ]
        })
        .with({ name: 'Products' }, (itm) => {
          result.productsGrid = (
            (itm.content as GridRelationsContent).grids?.[0].rows || []
          ).map((x) => ({ ...x, type: ComponentType.GridRelations }))
          result.topics = page.topics
        })
        .with({ name: 'Body' }, (itm) => {
          result.bodyBlocks = [
            ...(result.bodyBlocks || []),
            ...(
              (itm.content as ParagraphCollectionContent)?.paragraphs || []
            ).map(
              (
                x,
              ): WithType<
                RichTextContent,
                ComponentType.ParagraphCollection
              > => ({
                ...x.body,
                type: ComponentType.ParagraphCollection,
              }),
            ),
          ]
        })
        .with({ name: 'Sizes' }, () => {})
        .run()

      return result
    },
    {
      title: null,
      image: null,
      intro: null,
      productsGrid: null,
      bodyBlocks: null,
      topics: null,
    },
  )

  return {
    title: pageBlocks?.title,
    image: pageBlocks?.image,
    intro: pageBlocks?.intro,
    blocks: zip(pageBlocks?.bodyBlocks, pageBlocks?.productsGrid),
    topics: pageBlocks?.topics,
  }
}
