let support: boolean | undefined

/**
 * Check browser webp support
 * @returns {boolean}
 */
export const isWebpSupported = (): boolean => {
  if (typeof support !== 'undefined') return support

  const elem: HTMLCanvasElement | undefined =
    typeof document === 'object' ? document.createElement('canvas') : undefined

  support = elem?.toDataURL('image/webp').indexOf('data:image/webp') === 0

  return support
}
