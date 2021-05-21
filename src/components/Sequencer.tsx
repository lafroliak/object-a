import clsx from 'clsx'
import { memo, useEffect, useRef, useState } from 'react'

import SequenceMaker from '~lib/sequencer/sequencer'

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
  const [sequencer] = useState(() =>
    SequenceMaker.make({
      key: pageID,
      list,
      scaleMode: 'contain',
      canvas: canvas.current,
      hiDPI: false,
    }),
  )

  useEffect(() => {
    setLoaded(false)
    sequencer.reset({
      key: pageID,
      list,
      scaleMode: 'contain',
      canvas: canvas.current,
      hiDPI: false,
      queueComplete: () => void setLoaded(true),
    })
  }, [pageID, list])

  return (
    <>
      <canvas
        className={clsx(
          'absolute inset-0 w-full h-full opacity-0 transition-opacity duration-200 cursor-grab',
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
            className="absolute inset-0 w-full h-full transition-opacity duration-200 bg-center bg-no-repeat bg-contain filter blur"
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
              {() => <>drag to rotate</>}
            </IfElse>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(Sequencer)
