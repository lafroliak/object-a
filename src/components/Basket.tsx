import useBasket from '@stores/useBasket'
import useDrawer from '@stores/useDrawer'
import { motion } from 'framer-motion'
import { memo } from 'react'

import IfElse from './IfElse'

function Basket() {
  const opened = useDrawer((state) => state.opened)
  const items = useBasket((state) => state.items)
  const totals = useBasket((state) => state.totals)
  const clearItems = useBasket((state) => state.clearItems)

  return (
    <motion.div animate={{ opacity: !!opened ? 1 : 0 }}>
      <div>
        {items.map((item) => (
          <div key={item.id}>{`${item.name}`}</div>
        ))}
      </div>
      <div className="font-bold">
        {'Total: '}
        {totals().quantity}
        {' items for '}
        {totals().net} {totals().currency}
      </div>
      <IfElse predicate={totals().quantity > 0}>
        {() => (
          <button
            type="button"
            className="cursor-pointer focus:outline-none"
            onClick={clearItems}
          >
            [clean basket]
          </button>
        )}
      </IfElse>
    </motion.div>
  )
}

export default memo(Basket)
