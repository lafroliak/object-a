import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { HTMLMotionComponents } from 'framer-motion/types/render/html/types'
import { memo, ReactNode, useEffect } from 'react'
import useDrawer from '~stores/useDrawer'

import IfElse from './IfElse'

export const SIDES = {
  Top: 'top',
  Right: 'right',
  Bottom: 'bottom',
  Left: 'left',
} as const

export type Sides = Partial<typeof SIDES[keyof typeof SIDES]>

type Props = {
  opened: boolean
  onClose: () => void
  side: Sides
  content?: ReactNode
  as?: keyof HTMLMotionComponents
  layoutId?: string
}

function Popup({ opened, onClose, side, content, as, layoutId }: Props) {
  const close = useDrawer((state) => state.close)

  useEffect(() => {
    if (opened) close()
  }, [opened, close])

  const Element = motion[as || 'div']
  const variants = {
    [SIDES.Top]: {
      opened: { y: 0 },
      closed: { y: -100 },
    },
    [SIDES.Right]: {
      opened: { x: 0 },
      closed: { x: 100 },
    },
    [SIDES.Bottom]: {
      opened: { y: 0 },
      closed: { y: 100 },
    },
    [SIDES.Left]: {
      opened: { x: 0 },
      closed: { x: -100 },
    },
  }
  return (
    <AnimatePresence>
      <IfElse predicate={opened}>
        {() => (
          <>
            <Element
              layoutId={layoutId}
              key={layoutId}
              initial="closed"
              animate="opened"
              exit="closed"
              variants={variants[side]}
              className={clsx('fixed flex flex-row', {
                'items-start left-10 right-10 md:right-12 md:left-12 top-10 md:top-12':
                  side === SIDES.Top,
                'justify-end top-10 bottom-10 md:right-12 md:top-12 md:bottom-12':
                  side === SIDES.Right,
                'items-end left-10 right-10 md:right-12 md:left-12 bottom-10 md:bottom-12':
                  side === SIDES.Bottom,
                'justify-start top-10 bottom-10 md:left-12 md:top-12 md:bottom-12':
                  side === SIDES.Left,
              })}
            >
              <motion.div
                layoutId="popup_closer"
                key={'popup_closer'}
                className="fixed cursor-pointer inset-10 md:inset-12 -z-1 bg-color-500 bg-opacity-40"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 60, stiffness: 180 }}
              />
              <div
                className={clsx(
                  'flex-shrink-0 min-h-0 bg-color-100 dark:bg-color-800 overflow-y-auto scrollzone',
                  {
                    'max-w-[calc(100vw-2.5rem)] min-w-[33vw]':
                      side === SIDES.Left || side === SIDES.Right,
                    'max-h-[66vh]': side === SIDES.Top || side === SIDES.Bottom,
                  },
                )}
              >
                {content}
              </div>
              <button
                type="button"
                className="absolute top-0 right-0 m-4 text-xs cursor-pointer"
                onClick={onClose}
              >
                [close]
              </button>
            </Element>
          </>
        )}
      </IfElse>
    </AnimatePresence>
  )
}

export default memo(Popup)
