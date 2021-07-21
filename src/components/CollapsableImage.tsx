import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import useSpring from 'react-use/lib/useSpring'

import useCollapseImage from '~hooks/useCollapseImage'
import useMediaQuery from '~hooks/useMediaQuery'
import { ImageVariant } from '~lib/crystallize/types'
import { Option } from '~typings/utils'

import IfElse from './IfElse'

type Props = {
  image: Option<ImageVariant>
  placeholder: Option<string>
  isHovered?: boolean
  isTap?: boolean
  inverted?: boolean
  setLoaded?: Dispatch<SetStateAction<boolean>>
}

function Collapsable({
  image,
  isHovered = true,
  isTap = false,
  inverted = false,
  setLoaded = () => {},
}: Props) {
  const cref = useRef<HTMLCanvasElement>(null)
  const [min] = useState(() => Math.random() * (0.2 - 0.1) + 0.1)

  const onLoad = useCallback(() => {
    setLoaded(true)
  }, [])

  const [state, render] = useCollapseImage({
    image: image?.url,
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

  return <canvas className="absolute inset-0" ref={cref} />
}

function CollapsableImage(props: Props) {
  const { image, placeholder } = props
  const [loaded, setLoaded] = useState<boolean>(false)
  const isTouchScreen = useMediaQuery('isTouchScreen')
  const isSM = useMediaQuery('isSM')
  const hide = isTouchScreen || isSM

  useEffect(() => {
    if (hide && image?.url) {
      let img: HTMLCanvasElement | HTMLImageElement =
        document.createElement('img')
      img.onload = () => {
        setLoaded(true)
      }
      img.src = image?.url
    }
  }, [hide, image])

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
      <IfElse
        predicate={!hide}
        placeholder={
          <div className="absolute inset-0 grid overflow-hidden place-items-center">
            <img
              src={image.url}
              alt=""
              width={image.width}
              height={image.height || image.width}
            />
          </div>
        }
      >
        {() => <Collapsable {...props} setLoaded={setLoaded} />}
      </IfElse>
    </>
  )
}

export default memo(CollapsableImage)
