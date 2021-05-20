import { NextApiRequest, NextApiResponse } from 'next'

import { simplyFetchFromGraph } from '~lib/crystallize/graph'

interface CanonicalPageMap {
  [canonicalPageId: string]: string
}

interface SiteMap {
  canonicalPageMap: CanonicalPageMap
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  if (req.method !== 'GET') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  const siteMaps: SiteMap = {
    canonicalPageMap: {},
  }

  const { data } = await simplyFetchFromGraph({
    query: /* GraphQL */ `
      query ALL_PAGES(
        $language: String!
        $path: String!
        $version: VersionLabel!
      ) {
        catalogue(path: $path, language: $language, version: $version) {
          name
          children {
            path
          }
        }
      }
    `,
    variables: {
      language: 'en',
      path: '/',
      version: 'published',
    },
  })

  data.catalogue?.children?.forEach((page) => {
    if (
      page.path &&
      !['/success', '/cancel', '/homepage'].includes(page.path)
    ) {
      siteMaps.canonicalPageMap[
        `catalogue${page.path}`
      ] = `catalogue${page.path}`
    }
  })

  // cache sitemap for up to one hour
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, max-age=3600, stale-while-revalidate=3600',
  )
  res.setHeader('Content-Type', 'text/xml')
  res.write(createSitemap(siteMaps))
  res.end()
}

const createSitemap = (
  siteMap: SiteMap,
) => `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${process.env.SITE_URL}</loc>
      </url>

      <url>
        <loc>${process.env.SITE_URL}/</loc>
      </url>

      ${Object.keys(siteMap.canonicalPageMap)
        .map((canonicalPagePath) =>
          `
            <url>
              <loc>${process.env.SITE_URL}/${canonicalPagePath}</loc>
            </url>
          `.trim(),
        )
        .join('')}
    </urlset>
    `
