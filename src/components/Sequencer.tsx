import { memo, useEffect, useRef } from 'react'

import S from '@lib/sequencer/sequencer'
import { useWindowSize } from 'react-use'

type Props = {
  list: Array<string>
}

function Sequencer({ list }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)

  const { width, height } = useWindowSize()

  useEffect(() => {
    if (typeof window !== undefined) {
      S.make({
        list,
        scaleMode: 'contain',
        playMode: 'hover',
        direction: 'x',
        autoLoad: 'all',
        canvas: canvas.current,
      })
    }
  }, [list])

  return <canvas className="absolute inset-0 w-full h-full" width={width} height={height} ref={canvas} />
}

export default memo(Sequencer)
