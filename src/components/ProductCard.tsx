import { Product } from '@lib/crystallize/types'
import { Option } from '@typings/utils'
import clsx from 'clsx'
import { motion, useMotionValue } from 'framer-motion'
import { memo, useState } from 'react'

import CollapsableImage from './CollapsableImage'
import IfElse from './IfElse'

type Props = {
  item: Option<Product>
  index?: number
}

function ProductCard({ item, index = 0 }: Props) {
  const [isHovered, setHovered] = useState(false)
  const [isTap, setTap] = useState(false)
  const x = useMotionValue(0)

  if (!item) return null

  const { name, type, variants, defaultVariant } = item
  if (type === 'folder' || type === 'document') return null

  const variant = variants ? variants.find((v) => v.isDefault) : defaultVariant
  const priceVariants = variant?.priceVariants
  const images = variant?.images

  const image = (images?.[0] || variant?.image)?.variants?.find(
    (img) => img.width === 500 && !img.url.includes('webp'),
  )

  const { price, currency } =
    priceVariants?.find((pv) => pv.identifier === 'default') || {}

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
      className={clsx('w-full flex flex-col md:flex-row items-center', {
        'md:flex-row-reverse': index % 2 === 0,
        'cursor-pointer': isHovered,
      })}
    >
      <IfElse predicate={image?.url}>
        {(prop) => (
          <div>
            <CollapsableImage
              image={prop}
              isHovered={isHovered}
              isTap={isTap}
              inverted
            />
          </div>
        )}
      </IfElse>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              delayChildren: 0.2,
            },
          },
        }}
        initial="hidden"
        animate={isHovered ? 'show' : 'hidden'}
        className={clsx('h-1px bg-gray-400 flex-1')}
      />
      <motion.div
        className="flex flex-col justify-center flex-no-shrink"
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ delay: 0.25 }}
      >
        <IfElse predicate={name}>
          {(prop) => <h3>[objekt {prop.toLocaleLowerCase()}]</h3>}
        </IfElse>
        <IfElse predicate={{ price, currency }}>
          {(prop) => <div>{`${prop.price} ${prop.currency}`}</div>}
        </IfElse>
      </motion.div>
    </motion.div>
  )
}

export default memo(ProductCard)
