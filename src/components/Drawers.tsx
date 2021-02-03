import useDrawer from '@stores/useDrawer'
import clsx from 'clsx'
import { memo } from 'react'

import Basket from './Basket'
import BasketButton from './BasketButton'
import Drawer from './Drawer'
import * as styles from './Drawers.module.css'
import IfElse from './IfElse'
import Menu from './Menu'
import MenuButton from './MenuButton'

export const SIDES = {
  Top: 'top',
  Right: 'right',
  Bottom: 'bottom',
  Left: 'left',
} as const

export type Sides = Partial<typeof SIDES[keyof typeof SIDES]>

function Drawers() {
  const opened = useDrawer((state) => state.opened)
  const close = useDrawer((state) => state.close)
  const toggle = useDrawer((state) => state.toggle)

  return (
    <div
      className={clsx(
        'absolute inset-0 grid content-between min-h-screen w-screen',
        styles.drawers,
        opened ? styles[`opened-${opened}`] : null,
      )}
    >
      <div className={clsx('grid place-items-center', styles.r)}>
        <BasketButton />
      </div>
      <div className={clsx('grid place-items-center', styles.l)}>
        <MenuButton />
      </div>
      <Menu />
      <Drawer
        as="aside"
        side={SIDES.Right}
        name={
          <span
            role="button"
            className={clsx(
              'cursor-pointer focus:outline-none md:inline-block',
              {
                hidden: opened !== SIDES.Right,
              },
            )}
            onClick={() => toggle(SIDES.Right)}
          >
            [basket]
          </span>
        }
        content={<Basket />}
      />
      <Drawer
        as="aside"
        side={SIDES.Bottom}
        name={
          <button
            type="button"
            className="cursor-pointer focus:outline-none"
            onClick={() => toggle(SIDES.Bottom)}
          >
            [showcase]
          </button>
        }
        content={<div>SHOWCASE</div>}
      />
      <Drawer
        as="aside"
        side={SIDES.Left}
        disabled
        name={<span className="text-gray-500">[stories]</span>}
      />
      <IfElse predicate={opened}>
        {(prop) => (
          <div
            onClick={close}
            className={clsx(
              'bg-gray-400 bg-opacity-50 z-50 relative cursor-pointer',
              styles.closer,
              styles[`closer-${prop}`],
            )}
          />
        )}
      </IfElse>
    </div>
  )
}

export default memo(Drawers)
