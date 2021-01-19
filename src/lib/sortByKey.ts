const getKeyValue = <K extends keyof T, T>(key: K, obj: T): T[K] => obj[key]

export default function sortByKey<T extends {}>(key: keyof T, list: T[]): T[] {
  return list.sort((a, b): number => {
    const keyA = getKeyValue<keyof T, T>(key, a)
    const keyB = getKeyValue<keyof T, T>(key, b)
    if (keyA < keyB) return -1
    if (keyA > keyB) return 1
    return 0
  })
}
