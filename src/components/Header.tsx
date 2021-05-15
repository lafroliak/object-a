import clsx from 'clsx'
import dynamic from 'next/dynamic'
import Link from 'next/link'

import * as styles from './Header.module.css'
import Logo from './Logo'
import MenuButton from './MenuButton'

const CartButton = dynamic(import('./CartButton'), { ssr: false })

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
          <a title="to the homepage" className={clsx('w-28', styles.link)}>
            <Logo />
          </a>
        </Link>
        <div className={clsx(styles.r)}>
          <CartButton />
        </div>
      </nav>
    </header>
  )
}

export default Header
