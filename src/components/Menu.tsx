import clsx from 'clsx'
import getConfig from 'next/config'
import Link from 'next/link'

import Drawer from './Drawer'
import { SIDES } from './Drawers'
import * as styles from './Menu.module.css'

const { publicRuntimeConfig } = getConfig()

export default function Menu() {
  return (
    <Drawer
      as="header"
      side={SIDES.Top}
      name={
        <div className={clsx('grid w-full', styles.header)}>
          <Link href="/">
            <a
              title="to the homepage"
              className={clsx('grid place-items-center')}
            >
              {publicRuntimeConfig.SITE_NAME}
            </a>
          </Link>
        </div>
      }
      content={
        <menu className={clsx('grid m-0 p-0 h-full place-items-center')}>
          MENU
        </menu>
      }
    />
  )
}
