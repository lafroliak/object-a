import clsx from 'clsx'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { memo, useState } from 'react'
import useMediaQuery from '~hooks/useMediaQuery'
import { Product } from '~lib/crystallize/types'
import { isWebpSupported } from '~lib/isWebpSupported'
import { Option } from '~typings/utils'
import IfElse from './IfElse'
import * as styles from './ProductCard.module.css'

const CollapsableImage = dynamic(import('./CollapsableImage'), {
  loading: function Placeholder() {
    return (
      <div className="absolute inset-0 bg-gradient-to-bl from-color-100 to-color-200 dark:from-color-800 dark:to-color-900 animate-pulse" />
    )
  },
  ssr: false,
})

type Props = {
  item: Option<Product>
  index?: number
}

function ProductCard({ item, index = 0 }: Props) {
  const [isHovered, setHovered] = useState(false)
  const [isTap, setTap] = useState(false)
  const isSM = useMediaQuery('isSM')
  // const x = useMotionValue(0)

  if (!item) return null

  const { name, type, variants, defaultVariant } = item
  if (type === 'folder' || type === 'document') return null

  const variant = variants ? variants.find((v) => v.isDefault) : defaultVariant
  const images = variant?.images

  const placeholder = (images?.[0] || variant?.image)?.variants?.[0]
  const image = (images?.[0] || variant?.image)?.variants?.find(
    (img) =>
      img.width === (isSM ? 500 : 1024) &&
      img.url.includes(isWebpSupported() ? 'webp' : 'png'),
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
          show: { opacity: 1 },
        }}
        initial="hidden"
        animate={isHovered ? 'show' : 'hidden'}
        className={clsx('absolute top-1/2 h-1px from-rose-500 to-cyan-500', {
          'right-12 left-1/4 bg-gradient-to-r': index % 2 === 0,
          'right-1/4 left-12 bg-gradient-to-l': index % 2 !== 0,
        })}
      />
      <IfElse predicate={image}>
        {(prop) => (
          <div
            className={clsx(
              styles.image,
              'relative w-full aspect-h-1 aspect-w-1',
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
          <motion.div
            className={clsx('relative grid items-center', styles.name, {
              'justify-end': !isSM && index % 2 === 0,
              'justify-start': !isSM && index % 2 !== 0,
              'justify-center': isSM,
            })}
            initial={false}
            animate={{ opacity: isHovered || isSM ? 1 : 0 }}
            transition={{ delay: 0.05 }}
          >
            <h3
              className={clsx(
                'whitespace-nowrap uppercase bg-color-200 dark:bg-color-900',
                {
                  'pl-1': index % 2 === 0,
                  'pr-1': index % 2 !== 0,
                },
              )}
            >
              [{prop.trim()}]
            </h3>
          </motion.div>
        )}
      </IfElse>
    </motion.div>
  )
}

export default memo(ProductCard)
