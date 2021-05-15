import clsx from 'clsx'
import { memo, useEffect, useRef, useState } from 'react'

import S from '~lib/sequencer/sequencer'

import IconRotate from './IconRotate'
import IfElse from './IfElse'

type Props = {
  pageID: string
  list: Array<string>
  width?: number
  height?: number
  placeholder?: string
}

function Sequencer({ pageID, list, placeholder, width = 0 }: Props) {
  const [loaded, setLoaded] = useState<boolean>(false)
  const [dragging, setDragging] = useState<boolean>(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const instances = useRef<Record<string, S>>({})

  useEffect(() => {
    if (typeof window !== undefined) {
      if (!instances.current[pageID]) {
        const s = new S({
          list,
          scaleMode: 'contain',
          playMode: 'drag',
          direction: 'x',
          autoLoad: 'all',
          canvas: canvas.current,
          hiDPI: false,
          queueComplete: () => void setLoaded(true),
        })
        if (s) instances.current[pageID] = s
      }
    }
  }, [pageID, list])

  return (
    <>
      <canvas
        className={clsx(
          'absolute inset-0 w-full h-full opacity-0  cursor-grab',
          {
            'opacity-100': loaded,
            'cursor-grabbing': dragging,
          },
        )}
        onPointerDown={() => void setDragging(true)}
        onPointerUp={() => void setDragging(false)}
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
      <div
        className={clsx(
          'absolute bottom-0 grid w-full place-items-center transition-opacity duration-200 delay-200',
          {
            'opacity-0': dragging,
            'opacity-100': !dragging,
          },
        )}
      >
        <div className="grid gap-2 transform md:translate-y-full place-items-center text-color-500">
          <div
            className={clsx({
              'animate-spin': !loaded,
            })}
          >
            <IconRotate />
          </div>
          <div className="text-xs">
            <IfElse predicate={loaded} placeholder={<>loading...</>}>
              {() => <>drag for rotate</>}
            </IfElse>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(Sequencer)
