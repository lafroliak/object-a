import clsx from 'clsx'
import getConfig from 'next/config'
import Link from 'next/link'

import BasketButton from './BasketButton'
import * as styles from './Header.module.css'
import MenuButton from './MenuButton'

const { publicRuntimeConfig } = getConfig()

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        className={clsx(
          'grid relative w-full bg-color-100 dark:bg-color-800 place-items-center place-content-end sm:h-7 md:h-9',
          styles.header,
        )}
      >
        <div className={clsx(styles.l)}>
          <MenuButton />
        </div>
        <Link href="/">
          <a title="to the homepage" className={clsx(styles.link)}>
            {publicRuntimeConfig.SITE_NAME}
          </a>
        </Link>
        <div className={clsx(styles.r)}>
          <BasketButton />
        </div>
      </nav>
    </header>
  )
}

export default Header
