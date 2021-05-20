import { useMedia } from 'react-use'

const query = {
  isTouchScreen: 'isTouchScreen',
  isSM: 'isSM',
  isLG: 'isLG',
} as const

type Query = typeof query[keyof typeof query]

const QUERIES = {
  isTouchScreen: '(hover: none) and (pointer: coarse)',
  isSM: '(max-width: 767px)',
  isLG: '(min-width: 1024px)',
} as const

export default function useMediaQuery(query: Query) {
  return useMedia(QUERIES[query])
}
