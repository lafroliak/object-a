import { Product } from '~lib/crystallize/types'
import { Option } from '~typings/utils'

export default function normalizeItems(items: Option<Array<Product>>): string {
  const res: string[] = []

  if (!items) return res.join(',')

  items.forEach((item) => {
    if (!item.variants) return
    res.push(item.variants[0].sku || '')
  })

  return res.join(',')
}
