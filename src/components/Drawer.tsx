import useDrawer from '@stores/useDrawer'
import clsx from 'clsx'
import { motion, useMotionValue } from 'framer-motion'
import { HTMLMotionComponents } from 'framer-motion/types/render/dom/types'
import { memo, PropsWithChildren, ReactNode } from 'react'

import { SIDES, Sides } from './Drawers'
import * as styles from './Drawers.module.css'
import IfElse from './IfElse'

const swipeConfidenceThreshold = 6000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

type Props = {
  side: Sides
  name: ReactNode
  content?: ReactNode
  disabled?: boolean
  as?: keyof HTMLMotionComponents
}

function Drawer({
  name,
  side,
  content,
  as,
  disabled = false,
  children,
}: PropsWithChildren<Props>) {
  const opened = useDrawer((state) => state.opened)
  const toggle = useDrawer((state) => state.toggle)
  const x = useMotionValue(0)

  const isSidebar = ([SIDES.Left, SIDES.Right] as Sides[]).includes(side)

  const Element = motion[as || 'div']

  if (disabled) {
    return (
      <Element
        className={clsx(
          'relative grid place-items-center z-40 bg-gray-100 border-gray-400 border-solid',
          styles[side],
          {
            [styles.sidebar]: !!isSidebar,
          },
        )}
      >
        <div className={clsx({ [styles['text-vertical']]: isSidebar })}>
          {name}
        </div>
      </Element>
    )
  }

  return (
    <>
      <Element
        className={clsx(
          'relative grid place-items-center bg-gray-100 border-gray-400 border-solid',
          styles.drawer,
          styles[side],
          {
            [styles.opened]: opened === side,
            'z-50': opened === side,
            'z-40': opened !== side,
            [styles.sidebar]: !!isSidebar,
          },
        )}
        drag={isSidebar ? 'x' : 'y'}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        style={{ x }}
        onDragEnd={(_e, { offset, velocity }) => {
          const swipe = swipePower(
            isSidebar ? offset.x : velocity.y,
            isSidebar ? velocity.x : velocity.y,
          )

          if (swipe < -swipeConfidenceThreshold) {
            toggle(side)
          } else if (swipe > swipeConfidenceThreshold) {
            toggle(side)
          }
        }}
      >
        <div
          className={clsx(styles.name, {
            [styles['text-vertical']]: isSidebar,
          })}
        >
          {name}
        </div>
        <IfElse predicate={children && opened === side}>
          {() => <>{children}</>}
        </IfElse>
      </Element>
      <IfElse predicate={content && opened === side}>
        {() => (
          <motion.div
            className={clsx(
              'relative z-40 border-gray-400 border-solid bg-gray-100',
              styles.content,
              styles[`content-${side}`],
              {
                [styles.opened]: opened === side,
              },
            )}
            drag={isSidebar ? 'x' : 'y'}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            style={{ x }}
            onDragEnd={(_e, { offset, velocity }) => {
              const swipe = swipePower(
                isSidebar ? offset.x : velocity.y,
                isSidebar ? velocity.x : velocity.y,
              )

              if (swipe < -swipeConfidenceThreshold) {
                toggle(side)
              } else if (swipe > swipeConfidenceThreshold) {
                toggle(side)
              }
            }}
          >
            {content}
          </motion.div>
        )}
      </IfElse>
    </>
  )
}

export default memo(Drawer)
