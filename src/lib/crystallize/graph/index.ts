import { Query } from '../types'

interface Variables {
  path?: string
  language: 'en'
  version?: 'draft' | 'published'
}

interface Props {
  uri?: string
  query: string
  variables: Variables
}

/**
 * Helper for getting a catalogue item with a path
 * from url, removing any query params from the variables
 */
export function safePathQuery({ variables, ...rest }: Partial<Props>) {
  if (variables && 'path' in variables) {
    const safePath = (variables.path || '')
      .split('?')[0]
      .split('#')[0]
      .replace(/\/$/, '')

    return {
      variables: {
        ...variables,
        path: safePath,
      },
      ...rest,
    }
  }

  return {
    variables,
    ...rest,
  }
}

export async function simplyFetchFromGraph({
  uri = `https://api.crystallize.com/${process.env.NEXT_PUBLIC_CRYSTALLIZE_TENANT_IDENTIFIER}/catalogue`,
  query,
  variables,
}: Props): Promise<{ data: Query }> {
  const body = JSON.stringify(safePathQuery({ query, variables }))

  const response = await fetch(uri, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body,
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export function simplyFetchFromSearchGraph(args: Omit<Props, 'uri'>) {
  return simplyFetchFromGraph({
    uri: `https://api.crystallize.com/${process.env.NEXT_PUBLIC_CRYSTALLIZE_TENANT_IDENTIFIER}/search`,
    ...args,
  })
}
