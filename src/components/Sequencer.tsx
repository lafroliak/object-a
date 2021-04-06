import S from '@lib/sequencer/sequencer'
import { memo, useEffect, useRef } from 'react'

type Props = {
  list: Array<string>
  width?: number
  height?: number
}

function Sequencer({ list, width = 0, height = 0 }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window !== undefined) {
      S.make({
        list,
        scaleMode: 'contain',
        playMode: 'drag',
        direction: 'x',
        autoLoad: 'all',
        canvas: canvas.current,
      })
    }
  }, [list])

  return (
    <canvas
      className="absolute inset-0 w-full h-full"
      width={width}
      height={width}
      ref={canvas}
    />
  )
}

export default memo(Sequencer)
