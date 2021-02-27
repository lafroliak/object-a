import useDrawer from '@stores/useDrawer'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { memo } from 'react'
import { useMedia } from 'react-use'

import Basket from './Basket'
import Drawer from './Drawer'
import IfElse from './IfElse'

const Menu = dynamic(import('./Menu'), {
  loading: function Placeholder() {
    return <p>[loading...]</p>
  },
  ssr: false,
})

const Showcase = dynamic(import('./Showcase'), {
  loading: function Placeholder() {
    return <p>[loading...]</p>
  },
  ssr: false,
})

export const SIDES = {
  Top: 'top',
  Right: 'right',
  Bottom: 'bottom',
  Left: 'left',
  LeftHandler: 'left-handler',
} as const

export type Sides = Partial<typeof SIDES[keyof typeof SIDES]>

function Drawers() {
  const opened = useDrawer((state) => state.opened)
  const close = useDrawer((state) => state.close)
  const toggle = useDrawer((state) => state.toggle)
  const isSM = useMedia('(max-width: 767px)')

  return (
    <>
      <AnimatePresence>
        <IfElse predicate={!!opened}>
          {(prop) => (
            <motion.div
              layoutId="drawers_closer"
              key={prop ? 'drawers_closer' : 'nope'}
              className={clsx(
                'fixed top-10 md:top-12 bottom-10 md:bottom-12 left-0 right-0 md:left-12 md:right-12 bg-gray-400 bg-opacity-50 z-10 cursor-pointer',
              )}
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 60, stiffness: 180 }}
            />
          )}
        </IfElse>
      </AnimatePresence>
      <Drawer as="nav" side={SIDES.Top} content={<Menu />} />
      <Drawer
        as="aside"
        side={SIDES.Right}
        name={
          <button
            type="button"
            className={clsx(
              'cursor-pointer transform -rotate-90 -translate-x-2 focus:outline-none md:inline-block',
              {
                hidden: opened !== SIDES.Right,
              },
            )}
            onClick={() => toggle(SIDES.Right)}
          >
            [basket]
          </button>
        }
        content={<Basket />}
      />
      <AnimatePresence>
        <IfElse
          predicate={!isSM || opened === SIDES.Left}
          placeholder={
            <Drawer
              layoutId={SIDES.LeftHandler}
              as="nav"
              side={SIDES.LeftHandler}
              disabled
              name={<span className="text-gray-500">[stories]</span>}
            />
          }
        >
          {() => (
            <Drawer
              layoutId={SIDES.Left}
              as="aside"
              side={SIDES.Left}
              disabled
              name={
                <span className="text-gray-500 transform -rotate-90 md:translate-x-2">
                  [stories]
                </span>
              }
            />
          )}
        </IfElse>
      </AnimatePresence>
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
        content={<Showcase />}
      />
    </>
  )
}

export default memo(Drawers)
