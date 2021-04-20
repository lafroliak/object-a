import clsx from 'clsx'
import { memo, useEffect, useRef, useState } from 'react'

import S from '~lib/sequencer/sequencer'

import IconRotate from './IconRotate'
import IfElse from './IfElse'

type Props = {
  list: Array<string>
  width?: number
  height?: number
  placeholder?: string
}

function Sequencer({ list, placeholder, width = 0 }: Props) {
  const [loaded, setLoaded] = useState<boolean>(false)
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
        hiDPI: false,
        queueComplete: () => void setLoaded(true),
      })
    }

    return () => {
      S.remove()
    }
  }, [list])

  return (
    <>
      <canvas
        className={clsx('absolute inset-0 w-full h-full opacity-0', {
          'opacity-100': loaded,
        })}
        width={width}
        height={width}
        ref={canvas}
      />
      <IfElse predicate={placeholder && !loaded}>
        {() => (
          <div
            className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-contain filter blur"
            style={{ backgroundImage: `url(${placeholder})` }}
          />
        )}
      </IfElse>
      <div className="absolute bottom-0 grid w-full place-items-center">
        <div className="grid space-y-2 transform translate-y-full place-items-center text-color-500">
          <div
            className={clsx({
              'animate-spin': !loaded,
            })}
          >
            <IconRotate />
          </div>
          <div className="text-xs">
            <IfElse predicate={loaded} placeholder={<>lodading...</>}>
              {() => <>drag for rotate</>}
            </IfElse>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(Sequencer)
