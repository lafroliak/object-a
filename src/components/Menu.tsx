import { trpc } from '@lib/trpc'
import useDrawer from '@stores/useDrawer'
import Link from 'next/link'
import { useMemo } from 'react'

import { SIDES } from './Drawers'

const DRAWERS = [
  { side: SIDES.Right, name: '[basket]', disabled: false },
  { side: SIDES.Bottom, name: '[showcase]', disabled: false },
  { side: SIDES.Left, name: '[stories]', disabled: true },
]

export default function Menu() {
  const allPages = trpc.useQuery(['get-all-pages'])
  const pages = useMemo(() => allPages.data?.reverse() || [], [allPages.data])
  const toggle = useDrawer((state) => state.toggle)

  return (
    <menu className="grid grid-cols-2 p-0 m-0 list-none place-items-center auto-rows-min">
      {DRAWERS.map(({ side, name, disabled }) =>
        disabled ? (
          <li key={side} className="text-color-500">
            {name}
          </li>
        ) : (
          <li key={side}>
            <button
              type="button"
              className="block cursor-pointer focus:outline-none"
              onClick={() => toggle(side)}
            >
              {name}
            </button>
          </li>
        ),
      )}
      {pages.map((page) => (
        <li key={page.id}>
          <Link href={page.path === '/homepage' ? '/' : page.path || '/'}>
            <a>{page.name}</a>
          </Link>
        </li>
      ))}
    </menu>
  )
}
