import clsx from 'clsx'
import {
  motion,
  useAnimation,
  useDragControls,
  useMotionValue,
} from 'framer-motion'
import { HTMLMotionComponents } from 'framer-motion/types/render/html/types'
import { memo, ReactNode, useCallback, useEffect, useRef } from 'react'

import useMediaQuery from '~hooks/useMediaQuery'
import useDrawer from '~stores/useDrawer'

import * as styles from './Drawer.module.css'
import { SIDES, Sides } from './Drawers'
import IfElse from './IfElse'

type Props = {
  side: Sides
  name?: ReactNode
  content?: ReactNode
  disabled?: boolean
  as?: keyof HTMLMotionComponents
  layoutId?: string
}

export const contentVariants = {
  opened: { opacity: 1 },
  closed: { opacity: 0, transition: { duration: 0.05 } },
}

function Drawer({
  name,
  side,
  content,
  as,
  layoutId,
  disabled = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const opened = useDrawer((state) => state.opened)
  const open = useDrawer((state) => state.open)
  const close = useDrawer((state) => state.close)
  const isSM = useMediaQuery('isSM')
  const constrols = useAnimation()
  const isSidebar = ([SIDES.Left, SIDES.Right] as Sides[]).includes(side)
  const width = ref.current?.getBoundingClientRect().width ?? 0
  const height = ref.current?.getBoundingClientRect().height ?? 0
  const size = isSidebar ? width : height
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const dragControls = useDragControls()

  function startDrag(event: any) {
    dragControls.start(event, { snapToCursor: true })
  }

  useEffect(() => {
    if (!disabled) {
      constrols.start(opened === side ? 'opened' : 'closed')
    }
  }, [opened, constrols, disabled, side])

  const variants = {
    [SIDES.Top]: {
      opened: { y: size },
      closed: { y: isSM ? 40 : 48 },
    },
    [SIDES.Right]: {
      opened: { x: -size },
      closed: { x: isSM ? -12 : -48 },
    },
    [SIDES.Bottom]: {
      opened: { y: -size },
      closed: { y: isSM ? -40 : -48 },
    },
    [SIDES.Left]: {
      opened: { x: size },
      closed: { x: isSM ? 0 : 48 },
    },
    [SIDES.LeftHandler]: {
      opened: { y: 0, opacity: 0 },
      closed: { y: 0, opacity: 1 },
    },
  }

  const constraints = {
    [SIDES.Top]: { top: isSM ? 40 : 48, bottom: size },
    [SIDES.Right]: { right: isSM ? -12 : -48, left: -size },
    [SIDES.Bottom]: { bottom: isSM ? -40 : -48, top: -size },
    [SIDES.Left]: { left: isSM ? 0 : 48, right: size },
    [SIDES.LeftHandler]: { top: -40, bottom: 0 },
  }

  const handleDragEnd = useCallback(
    (_event, { offset }) => {
      let isDraggingRightWay
      switch (side) {
        case SIDES.Top:
          isDraggingRightWay = offset.y > 0
          break
        case SIDES.Right:
          isDraggingRightWay = offset.x < 0
          break
        case SIDES.Bottom:
        case SIDES.LeftHandler:
          isDraggingRightWay = offset.y < 0
          break
        case SIDES.Left:
          isDraggingRightWay = isSM ? offset.y > 0 : offset.x > 0
          break
        default:
          break
      }
      const multiplier = isDraggingRightWay ? 1 / 10 : 1 / 12
      const threshold = isSM ? 40 : 48 * multiplier

      if (Math.abs(offset.x) > threshold || Math.abs(offset.y) > threshold) {
        if (isDraggingRightWay) {
          open(side === SIDES.LeftHandler ? SIDES.Left : side)
        } else {
          close()
        }
      } else {
        if (!opened) {
          open(side === SIDES.LeftHandler ? SIDES.Left : side)
        }
        constrols.start(opened ? 'closed' : 'opened')
      }
    },
    [constrols, close, open, opened, isSM, side],
  )

  const Element = motion[as || 'div']

  return (
    <Element
      className={clsx('fixed z-30', {
        'right-0 left-0 top-0 md:left-12 md:right-12': side === SIDES.Top,
        'right-0 top-10 bottom-10 md:top-12 md:bottom-12': side === SIDES.Right,
        'right-0 bottom-0 left-0 md:right-12 md:left-12': side === SIDES.Bottom,
        'right-0 bottom-20 left-0': side === SIDES.LeftHandler,
        'left-0 bottom-10 top-10 md:top-12 md:bottom-12': side === SIDES.Left,
        'z-40': opened === side,
      })}
    >
      <motion.div
        className="absolute inset-0"
        style={{ x, y }}
        drag={disabled ? undefined : isSidebar ? 'x' : 'y'}
        dragElastic={0}
        dragMomentum={false}
        dragConstraints={
          side === SIDES.Left && isSM
            ? constraints[SIDES.Bottom]
            : constraints[side]
        }
        onDragEnd={handleDragEnd}
        dragControls={dragControls}
      />
      <motion.div
        layoutId={layoutId}
        key={layoutId}
        ref={ref}
        className={clsx(
          'absolute grid md:bg-color-100 md:dark:bg-color-800',
          styles.drawer,
          styles[side],
          {
            'sm:bg-color-100 sm:dark:bg-color-800':
              side !== SIDES.Right || (side === SIDES.Right && opened === side),
            'right-0 left-0 bottom-0': side === SIDES.Top,
            'top-0 bottom-0': side === SIDES.Right,
            'right-0 left-0':
              side === SIDES.Bottom || side === SIDES.LeftHandler,
            'bottom-0 top-0': side === SIDES.Left,
          },
        )}
        initial="closed"
        animate={constrols}
        variants={variants[side]}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', damping: 60, stiffness: 180 }}
        style={{ x, y }}
      >
        <div
          onPointerDown={startDrag}
          className={clsx(
            'w-full h-full grid place-items-center border-opacity-0 border-color-500 border-solid transition duration-100 ease-in-out delay-100',
            styles.handler,
            {
              'opacity-0': disabled,
              'opacity-30 md:hover:opacity-100 md:hover:border-blue-500 md:hover:border-opacity-100':
                !disabled,
              'border-b-2': side === SIDES.Top,
              'border-l-2': side === SIDES.Right,
              'border-t-2': side === SIDES.Bottom || side === SIDES.LeftHandler,
              'border-r-2': side === SIDES.Left,
              'border-opacity-100': opened === side,
              'cursor-[col-resize]': isSidebar,
              'cursor-[row-resize]': !isSidebar,
            },
          )}
        >
          <div
            className={clsx('bg-color-500 hover:bg-blue-500 rounded-sm', {
              'w-1 h-4': isSidebar,
              'w-4 h-1': !isSidebar,
            })}
          />
        </div>
        <IfElse predicate={!!name}>
          {() => (
            <motion.nav
              className={clsx(
                'grid place-content-center place-items-start',
                styles.name,
              )}
              initial="closed"
              animate={
                side === SIDES.Right && isSM && opened !== SIDES.Right
                  ? 'closed'
                  : 'opened'
              }
              variants={contentVariants}
            >
              {name}
            </motion.nav>
          )}
        </IfElse>
        <motion.div
          className={clsx('grid relative', styles.content, {
            'place-items-center pt-10 md:pt-12': side === SIDES.Top,
          })}
          initial="closed"
          animate={constrols}
          variants={contentVariants}
        >
          {content}
        </motion.div>
      </motion.div>
    </Element>
  )
}

export default memo(Drawer)
