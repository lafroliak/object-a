import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import { memo, useEffect } from 'react'
import { usePrevious } from 'react-use'

import useDrawer from '~stores/useDrawer'

import Cart from './Cart'
import Drawer from './Drawer'
import IfElse from './IfElse'

const PageContent = dynamic(import('./PageContent'), {
  loading: function Placeholder() {
    return <div>[loading...]</div>
  },
  ssr: false,
})

const Menu = dynamic(import('./Menu'), {
  loading: function Placeholder() {
    return <div>[loading...]</div>
  },
  ssr: false,
})

const Showcase = dynamic(import('./Showcase'), {
  loading: function Placeholder() {
    return (
      <div className="w-full h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] bg-color-500 animate-pulse">
        [loading...]
      </div>
    )
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
  const router = useRouter()
  const prevPathname = usePrevious(router.asPath)

  useEffect(() => {
    if (prevPathname !== router.asPath) {
      close()
    }
  }, [router.asPath, prevPathname, close])

  return (
    <>
      <AnimatePresence>
        <IfElse predicate={!!opened}>
          {(prop) => (
            <motion.div
              layoutId="drawers_closer"
              key={prop ? 'drawers_closer' : 'nope'}
              className={clsx(
                'fixed top-10 md:top-12 bottom-10 md:bottom-12 left-0 right-0 md:left-12 md:right-12 bg-color-500 bg-opacity-40 z-10 cursor-pointer',
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
            [cart]
          </button>
        }
        content={<Cart />}
      />
      {/* <AnimatePresence>
        <IfElse predicate={isSM && opened !== SIDES.Left}>
          {() => (
            <Drawer
              layoutId={SIDES.LeftHandler}
              as="aside"
              side={SIDES.LeftHandler}
              name={
                <button
                  type="button"
                  className="cursor-pointer focus:outline-none md:inline-block"
                  onClick={() => toggle(SIDES.Left)}
                >
                  [about]
                </button>
              }
            />
          )}
        </IfElse>
      </AnimatePresence> */}
      <Drawer
        layoutId={SIDES.Left}
        as="aside"
        side={SIDES.Left}
        name={
          <button
            type="button"
            className="transform -rotate-90 translate-x-2 cursor-pointer focus:outline-none md:inline-block"
            onClick={() => toggle(SIDES.Left)}
          >
            [about]
          </button>
        }
        content={
          <div className="p-8 space-y-8">
            <PageContent path="/about" />
          </div>
        }
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
        content={<Showcase />}
      />
    </>
  )
}

export default memo(Drawers)
