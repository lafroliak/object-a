import Link from 'next/link'
import { memo } from 'react'

import BasketButton from './BasketButton'

function Header() {
  return (
    <header className="flex flex-row justify-between w-full p-4">
      <Link href="/">
        <a className="justify-self-center">
          <h1>object a</h1>
        </a>
      </Link>
      <div className="justify-self-end">
        <BasketButton />
      </div>
    </header>
  )
}
export default memo(Header)
