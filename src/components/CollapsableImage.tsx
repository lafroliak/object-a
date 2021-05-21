import { memo, useCallback, useEffect, useRef, useState } from 'react'
import useSpring from 'react-use/lib/useSpring'

import useCollapseImage from '~hooks/useCollapseImage'
import { Option } from '~typings/utils'

import IfElse from './IfElse'

type Props = {
  image: Option<string>
  placeholder: Option<string>
  isHovered?: boolean
  isTap?: boolean
  inverted?: boolean
}
function CollapsableImage({
  image,
  placeholder,
  isHovered = true,
  isTap = false,
  inverted = false,
}: Props) {
  const cref = useRef<HTMLCanvasElement>(null)
  const [min] = useState(() => Math.random() * (0.2 - 0.1) + 0.1)
  const [loaded, setLoaded] = useState<boolean>(false)

  const onLoad = useCallback(() => {
    setLoaded(true)
  }, [])

  const [state, render] = useCollapseImage({
    image,
    cref,
    sp: 48,
    start: inverted ? 1 : min,
    onLoad,
  })

  const [target, setTarget] = useState(0)
  const value = useSpring(target, 170, 26)

  useEffect(() => {
    state.current.threshold = Math.max(
      0,
      Math.min(state.current.cells, Math.round(value)),
    )
    render()
  }, [value, state, render])

  useEffect(() => {
    if (state.current.cells) {
      const percent = isTap
        ? inverted
          ? 0
          : min
        : isHovered
        ? inverted
          ? min
          : 1
        : inverted
        ? 1
        : min
      const newThresh = state.current.cells - percent * state.current.cells
      setTarget(newThresh)
    }
  }, [state, min, isHovered, isTap, inverted])

  if (!image) return null

  return (
    <>
      <IfElse predicate={!!placeholder && !loaded}>
        {() => (
          <div
            className="absolute inset-0 bg-no-repeat bg-contain filter blur"
            style={{ backgroundImage: `url(${placeholder})` }}
          />
        )}
      </IfElse>
      <canvas className="absolute inset-0" ref={cref} />
    </>
  )
}

export default memo(CollapsableImage)
