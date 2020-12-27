import { memo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useClickAway } from 'react-use'

import useBasket from '@stores/useBasket'

import Basket from './Basket'
import BasketButton from './BasketButton'

function BasketDrawer() {
  const ref = useRef(null)
  const opened = useBasket((state) => state.opened)
  const close = useBasket((state) => state.close)
  useClickAway(ref, close)

  return (
    <motion.aside
      ref={ref}
      animate={{ x: opened ? '0%' : '100%' }}
      transition={{ ease: 'easeOut', duration: 0.35 }}
      className="fixed top-0 bottom-0 right-0 w-1/4 p-4 bg-white ring-1 ring-black"
    >
      <div className="flex flex-row items-start justify-between">
        Basket
        <BasketButton />
      </div>
      <Basket />
    </motion.aside>
  )
}

export default memo(BasketDrawer)
