import { Component, ImageContent } from './types'

export function isImage(type: Component['type'], content: Component['content']): content is ImageContent {
  return type === 'images'
}
