import { memo } from 'react'
import { motion } from 'framer-motion'

import useBasket from '@stores/useBasket'
import ProductCard from './ProductCard'

function Basket() {
  const opened = useBasket((state) => state.opened)
  const items = useBasket((state) => state.items)
  const totals = useBasket((state) => state.totals)

  return (
    <motion.div animate={{ opacity: opened ? 1 : 0 }}>
      <div>
        {items.map((item) => (
          <ProductCard item={item} key={item.id} />
        ))}
      </div>
      <div className="font-bold">
        {'Total: '}
        {totals().quantity}
        {' items for '}
        {totals().net} {totals().currency}
      </div>
    </motion.div>
  )
}

export default memo(Basket)
