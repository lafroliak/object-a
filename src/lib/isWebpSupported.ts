let support: boolean | undefined

function hasWebP(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined') {
      var img = new Image()
      img.onload = () => {
        resolve(true)
      }
      img.onerror = () => {
        reject(false)
      }
      img.src = 'http://www.gstatic.com/webp/gallery/1.webp'
    }
  })
}

/**
 * Check browser webp support
 * @returns {boolean}
 */
export const isWebpSupported = async (): Promise<boolean> => {
  if (typeof support !== 'undefined') return support

  support = await hasWebP()

  return support
}
