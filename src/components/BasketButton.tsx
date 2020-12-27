import useBasket from '@stores/useBasket'
import IfElse from './IfElse'

export default function BasketButton() {
  const items = useBasket((state) => state.items)
  const toggle = useBasket((state) => state.toggle)

  return (
    <button type="button" onClick={toggle}>
      <>
        {'basket '}
        <IfElse predicate={items.length}>{(length) => <>{length}</>}</IfElse>
      </>
    </button>
  )
}
