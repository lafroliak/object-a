import { memo } from 'react'

import useMediaQuery from '~hooks/useMediaQuery'
import { isImage } from '~lib/crystallize/isType'
import { Product } from '~lib/crystallize/types'
import { isWebpSupported } from '~lib/isWebpSupported'
import { Option } from '~typings/utils'

import IfElse from './IfElse'

type Props = {
  item: Option<Product>
}

function ModelsCard({ item }: Props) {
  const isLG = useMediaQuery('isLG')

  if (!item) return null

  const { name, type, components } = item
  if (type === 'folder' || type === 'document') return null

  const models = components?.find((c) => c?.name === 'Models' && c?.content)
  const images = components?.find((c) => c?.name === 'Images' && c?.content)
  const modelsContent =
    models && isImage(models.type, models.content) ? models.content : null
  const imagesContent =
    images && isImage(images.type, images.content) ? images.content : null
  const image = (modelsContent?.images ||
    imagesContent?.images)?.[0]?.variants?.find(
    (img) =>
      img.width === (isLG ? 768 : 500) &&
      img.url.includes(isWebpSupported() ? 'webp' : 'png'),
  )

  return (
    <>
      <IfElse predicate={image}>
        {(prop) => (
          <picture className="relative flex-1 block w-full h-full aspect-w-1 aspect-h-1">
            <div className="absolute inset-0 grid overflow-hidden place-items-center">
              <img
                src={prop.url}
                alt={`${item?.name || ''}`}
                width={prop.width}
                height={prop.height || prop.width}
              />
            </div>
          </picture>
        )}
      </IfElse>
      <IfElse predicate={name}>
        {(prop) => (
          <h3 className="text-sm text-center whitespace-nowrap">
            <span className="relative">
              {'['}
              {prop.trim()}
              {']'}
            </span>
          </h3>
        )}
      </IfElse>
    </>
  )
}

export default memo(ModelsCard)