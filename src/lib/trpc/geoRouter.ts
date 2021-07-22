import { createRouter } from '~pages/api/trpc/[trpc]'

type Location = {
  country_code?: string
  country_name?: string
  city?: string
  postal?: string
  latitude?: number
  longitude?: number
  IPv4?: string
  state?: string
}

export const geoRouter = createRouter().query('getLocation', {
  async resolve({ ctx }) {
    ctx.res?.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800',
    )

    const res = await fetch('https://geolocation-db.com/json/')
    const location = res.json()

    return location as Location
  },
})
