import { MouseEvent, MutableRefObject, useCallback, useEffect, useRef } from 'react'

import { Option } from '@typings/utils'
import sortByKey from '@lib/sortByKey'

type Props = {
  image: Option<string>
  cref: MutableRefObject<HTMLCanvasElement | null>
  sp?: number
}

type State = {
  threshold: number
  cells: number
  ordered: number[][]
  grid: number[][][]
  cols: number
  rows: number
  imc: CanvasImageSource
  tiles: { x: number; y: number }[]
}

export default function useCollapseImage({ image, cref, sp = 16 }: Props) {
  const clearRenderRef = useRef(false)
  const state = useRef<State>({} as State)

  const spx = useCallback(
    function spx(array: [number, number, number, number]): [number, number, number, number] {
      return array.map((v) => v * sp) as [number, number, number, number]
    },
    [sp],
  )

  const render = useCallback(
    function render() {
      clearRenderRef.current = false
      const c = cref.current
      const cx = c?.getContext('2d')
      const { cells, ordered, threshold, grid, cols, rows, imc, tiles } = state.current

      // active
      const active: [number | null, number | null, boolean][][] = [...Array(rows)].map((_, y) =>
        [...Array(cols)].map((__, x) => [x, y, false]),
      )
      for (let i = threshold; i < cells; i += 1) {
        const tile = tiles[i]
        const { x } = tile
        const { y } = tile
        active[y][x][2] = true
      }

      function getFree(x: number, y: number) {
        // it it off map it is undefined
        if (active[y] === undefined) return null
        if (active[y][x] === undefined) return null
        const check = active[y][x]
        // false means empty
        if (check[2] === false) {
          return grid[y][x]
        }
        return null

        // return if false
        // if (coords) {
        //   let [gx, gy] = coords
        // }
      }

      function getMove(x: number, y: number) {
        const raw: (number[] | null)[] = [
          [0, -1],
          [1, -1],
          [1, 1],
          [1, 0],
          [1, 1],
          [0, 1],
          [-1, 1],
          [-1, 0],
          [-1, -1],
        ].map((v) => getFree(x + v[0], y + v[1]))
        const self = grid[y][x]
        const filtered = raw.filter((v) => v !== null)
        const distances = filtered.map((v) => (v ? parseFloat(`${v[2]}`) : 0))
        const minDistance = distances.reduce((res, cur) => Math.min(res, cur), Infinity)
        if (minDistance < self[2]) {
          const minI = distances.indexOf(minDistance)
          return filtered[minI]
        }
        return null
      }

      function renderM() {
        let leastActive = true
        let moved = false

        for (let i = 0; i < cells; i += 1) {
          const [x, y] = ordered[i]
          const check = active[y][x]
          if (check[2] === true) {
            leastActive = false
            const moveTo = getMove(x, y)
            if (moveTo !== null) {
              moved = true
              const [mx, my] = moveTo
              // let old = active[my][mx].slice()
              const old = [null, null, false] as [number | null, number | null, boolean]
              active[my][mx] = check
              active[y][x] = old
            }
          }
        }

        if (leastActive && c && cx) {
          cx.clearRect(0, 0, c.width, c.height)
        }
        if (!moved) {
          // only draw when done
          for (let i = 0; i < cells; i += 1) {
            const x = i % cols
            const y = Math.floor(i / cols)
            const check = active[y][x]
            if (!Number.isNaN(check[0]) && !Number.isNaN(check[1]) && check[2] && cx) {
              cx.drawImage(imc, ...spx([check[0] as number, check[1] as number, 1, 1]), ...spx([x, y, 1, 1]))
            }
          }
        } else if (moved && !clearRenderRef.current && cx && c) {
          cx.clearRect(0, 0, c.width, c.height)

          // for (let i = 0; i < cells; i++) {
          //   let x = i % cols
          //   let y = Math.floor(i / cols)
          //   let check = active[y][x]
          //   // if (check) {
          //   cx.drawImage(
          //     imc,
          //     ...spx([...check.slice(0, 2), 1, 1]),
          //     ...spx([x, y, 1, 1])
          //   )
          //   // }
          // }

          renderM()
        }
      }

      renderM()
    },
    [cref, spx],
  )

  const loadImage = useCallback(
    function loadImage(src: string) {
      const c = cref.current

      if (!c) return

      const cx = c.getContext('2d')
      let img: HTMLCanvasElement | HTMLImageElement = document.createElement('img')
      img.onload = () => {
        const aspect = img.width / img.height
        const windowAspect = (window.innerWidth - sp) / (window.innerHeight - sp * 8)

        let snapw
        let snaph
        if (aspect < windowAspect) {
          // worry about height
          const adjHeight = Math.min(img.height, Math.floor(window.innerHeight - sp * 8))
          snaph = Math.round(adjHeight / sp) * sp
          const snapr = snaph / img.height
          snapw = Math.round((img.width * snapr) / sp) * sp
        } else {
          // worry about width
          const adjWidth = Math.min(img.width, Math.floor(window.innerWidth - sp) - sp / 2)
          snapw = Math.round(adjWidth / sp) * sp
          const snapr = snapw / img.width
          snaph = Math.round((img.height * snapr) / sp) * sp
        }

        img.width = snapw
        img.height = snaph

        c.width = img.width
        c.height = img.height

        const cols = img.width / sp
        const rows = img.height / sp
        const cells = cols * rows

        // preserve dimensions
        const tImg = document.createElement('canvas')
        tImg.width = c.width
        tImg.height = c.height
        const tImgx = tImg.getContext('2d')
        tImgx?.drawImage(img, 0, 0, c.width, c.height)
        img = tImg

        // draw original image
        // cx.drawImage(img, 0, 0, c.width, c.height)

        // store original image
        const imc = document.createElement('canvas')
        imc.width = c.width
        imc.height = c.height
        const imx = imc.getContext('2d')
        imx?.drawImage(img, 0, 0, c.width, c.height)

        // cut up original image
        let tiles = []
        for (let i = 0; i < cells; i += 1) {
          const t = document.createElement('canvas')
          t.width = sp
          t.height = sp
          const tx = t.getContext('2d')

          const x = i % cols
          const y = Math.floor(i / cols)

          tx?.drawImage(imc, x * sp, y * sp, sp, sp, 0, 0, sp, sp)

          const complexity = t?.toDataURL().length / (sp * sp)

          tiles.push({ t, c: complexity, x, y, i })
        }
        tiles = sortByKey('c', tiles)

        // grid with coordinates
        const grid = [...Array(rows)].map((_, y) =>
          [...Array(cols)].map((__, x) => {
            const d = parseFloat(Math.sqrt((x - cols / 2) ** 2 + (y - rows / 2) ** 2).toFixed(8))
            return [x, y, d]
          }),
        )

        // spiral order for iteration
        const ordered = grid.flat()
        ordered.sort(function sort(a, b) {
          return a[2] - b[2]
        })

        // spiral test
        // for (let i = 0; i < 800; i += 1) {
        //   const [x, y] = ordered[i]
        //   cx?.fillRect(...spx([x, y, 1, 1]))
        // }

        const threshold = cells - Math.round(cells / 2)
        state.current.threshold = threshold
        state.current.cells = cells
        state.current.ordered = ordered
        state.current.grid = grid
        state.current.cols = cols
        state.current.rows = rows
        state.current.imc = imc
        state.current.tiles = tiles

        render()
      }
      img.src = `${src}?${new Date().getTime()}`
      img.setAttribute('crossOrigin', '*')
    },
    [cref, render, sp],
  )

  useEffect(() => {
    if (image) loadImage(image)
  }, [image, loadImage])

  function setThreshold(e: MouseEvent<HTMLCanvasElement>) {
    if (cref.current) {
      const rect = cref.current.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / cref.current.width
      const { cells } = state.current
      const newThresh = cells - Math.min(cells, Math.max(0, Math.round(percent * cells)))
      state.current.threshold = newThresh

      render()
    }
  }

  return [state.current, setThreshold] as const
}
