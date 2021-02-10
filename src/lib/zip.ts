export default function zip<A extends any, B extends any>(
  a: A[] | undefined | null,
  b: B[] | undefined | null,
): Array<A | B> {
  if (!a || !b) return []

  const result: any[] = []

  for (var i = 0, length = Math.max(a.length, b.length); i < length; i++) {
    a[i] && result.push(a[i] as A)
    b[i] && result.push(b[i] as B)
  }

  return result
}
