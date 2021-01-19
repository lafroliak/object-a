import { memo, useRef } from 'react'

import { Option } from '@typings/utils'
import useCollapseImage from '@hooks/useCollapseImage'

type Props = {
  image: Option<string>
}
function CollapsableImage({ image }: Props) {
  const cref = useRef<HTMLCanvasElement>(null)

  const [, handleMouseMove] = useCollapseImage({
    image,
    cref,
  })

  if (!image) return null

  return (
    <div className="">
      <canvas ref={cref} onMouseMove={handleMouseMove} onFocus={() => {}} />
    </div>
  )
}

export default memo(CollapsableImage)
