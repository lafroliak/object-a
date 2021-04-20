let support: boolean | undefined

function hasAvif(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    var img = new Image()
    img.onload = () => {
      resolve(true)
    }
    img.onerror = () => {
      reject(false)
    }
    img.src =
      'http://download.opencontent.netflix.com.s3.amazonaws.com/AV1/Chimera/AVIF/Chimera-AV1-8bit-1280x720-3363kbps-6.avif'
  })
}

/**
 * Check browser avif support
 * @returns {boolean}
 */
export const isAvifSupported = async (): Promise<boolean> => {
  if (typeof support !== 'undefined') return support

  support = await hasAvif()

  return support
}
