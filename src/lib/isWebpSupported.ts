let support: boolean | undefined

function hasWebP(): boolean {
  if (typeof window !== 'undefined') {
    var img = new Image()
    img.onload = () => {
      return true
    }
    img.onerror = () => {
      return false
    }
    img.src = 'http://www.gstatic.com/webp/gallery/1.webp'
  }
  return false
}

/**
 * Check browser webp support
 * @returns {boolean}
 */
export const isWebpSupported = (): boolean => {
  if (typeof support !== 'undefined') return support

  support = hasWebP()

  return support
}
