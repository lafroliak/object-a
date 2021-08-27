import Link from 'next/link'

import { trpc } from '~lib/trpc'
import useDrawer from '~stores/useDrawer'

import { SIDES } from './Drawers'

const DRAWERS = [
  { side: SIDES.Right, name: '[cart]', disabled: false },
  { side: SIDES.Bottom, name: '[showcase]', disabled: false },
  { side: SIDES.Left, name: '[about]', disabled: false },
]

export default function Menu() {
  const { data: pagesData } = trpc.useQuery(['crystallize.get-all-pages'])
  const pages = pagesData?.pages
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
          {pages
            ?.filter(
              (p) =>
                p.path &&
                ['/pre-order', '/shipping-and-returns', '/contact-us'].includes(
                  p.path,
                ),
            )
            .map((page) => (
              <li key={page.path}>
                <Link
                  href={
                    page.path === '/homepage'
                      ? '/'
                      : page.path
                      ? {
                          pathname: '/catalogue/[...catalogue]',
                          query: {
                            catalogue: decodeURIComponent(page.path).replace(
                              /^\//,
                              '',
                            ),
                          },
                        }
                      : '/'
                  }
                >
                  <a>[{page.name?.toLowerCase()}]</a>
                </Link>
              </li>
            ))}
        </menu>
      }
    </div>
  )
}
