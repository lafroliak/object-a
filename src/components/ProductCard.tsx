import { Product } from '@lib/crystallize/types'
import { Option } from '@typings/utils'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { memo, useState } from 'react'

import CollapsableImage from './CollapsableImage'
import IfElse from './IfElse'
import * as styles from './ProductCard.module.css'

type Props = {
  item: Option<Product>
  index?: number
}

function ProductCard({ item, index = 0 }: Props) {
  const [isHovered, setHovered] = useState(false)
  const [isTap, setTap] = useState(false)
  // const x = useMotionValue(0)

  if (!item) return null

  const { name, type, variants, defaultVariant } = item
  if (type === 'folder' || type === 'document') return null

  const variant = variants ? variants.find((v) => v.isDefault) : defaultVariant
  const images = variant?.images

  const placeholder = (images?.[0] || variant?.image)?.variants?.[0]
  const image = (images?.[0] || variant?.image)?.variants?.find(
    (img) => img.width === 500 && !img.url.includes('webp'),
  )

  return (
    <motion.div
      // layoutId={item.id}
      initial="initial"
      animate="animate"
      exit="exit"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={() => setTap(true)}
      onMouseUp={() => setTap(false)}
      className={clsx('grid w-full relative', styles.card, {
        [styles.reversed]: index % 2 === 0,
        'cursor-pointer': isHovered,
      })}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              delayChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate={isHovered ? 'show' : 'hidden'}
        className={clsx('absolute top-1/2 h-1px bg-color-500', {
          'right-12 left-1/4': index % 2 === 0,
          'right-1/4 left-12': index % 2 !== 0,
        })}
      />
      <IfElse predicate={image?.url}>
        {(prop) => (
          <div
            className={clsx(
              styles.image,
              'relative grid w-full aspect-h-1 aspect-w-1',
            )}
          >
            <CollapsableImage
              image={prop}
              placeholder={placeholder?.url}
              isHovered={isHovered}
              isTap={isTap}
              inverted
            />
          </div>
        )}
      </IfElse>
      <IfElse predicate={name}>
        {(prop) => (
          <div
            className={clsx('relative grid items-center', styles.name, {
              'justify-end': index % 2 === 0,
              'justify-start': index % 2 !== 0,
            })}
          >
            <h3
              className={clsx(
                'whitespace-nowrap bg-color-200 dark:bg-color-900',
                {
                  'pl-1': index % 2 === 0,
                  'pr-1': index % 2 !== 0,
                },
              )}
            >
              [objekt {prop.toLocaleLowerCase()}]
            </h3>
          </div>
        )}
      </IfElse>
    </motion.div>
  )
}

export default memo(ProductCard)
