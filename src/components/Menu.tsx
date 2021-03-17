import useDrawer from '@stores/useDrawer'
import Link from 'next/link'

import { SIDES } from './Drawers'
import { useGlobalState } from './GlobalStateProvider'

const DRAWERS = [
  { side: SIDES.Right, name: '[basket]', disabled: false },
  { side: SIDES.Bottom, name: '[showcase]', disabled: false },
  { side: SIDES.Left, name: '[stories]', disabled: true },
]

export default function Menu() {
  const { pages } = useGlobalState()
  const toggle = useDrawer((state) => state.toggle)

  return (
    <div className="grid grid-cols-2 p-0 m-0 place-items-center">
      <menu className="list-none">
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
      </menu>
      {
        <menu className="list-none">
          {pages?.map((page) => (
            <li key={page.path}>
              <Link
                href={
                  page.path === '/homepage'
                    ? '/'
                    : page.path
                    ? `/catalogue${page.path}`
                    : '/'
                }
              >
                <a>{page.name}</a>
              </Link>
            </li>
          ))}
        </menu>
      }
    </div>
  )
}
