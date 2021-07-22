import { NextApiRequest, NextApiResponse } from 'next'

export default async function RobotsTxt(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  // cache robots.txt for up to 60 seconds
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, max-age=60, stale-while-revalidate=60',
  )
  res.setHeader('Content-Type', 'text/plain')
  res.write(`# Allow all user agents.
User-agent: *
Allow: /

# Allow all user agents.
User-agent: *
Disallow: /api/
Disallow: /success
Disallow: /cancel
Disallow: /_error
Disallow: /404
Disallow: /500
  
Sitemap: ${process.env.SITE_URL}/api/sitemap.xml
`)
  res.end()
}
