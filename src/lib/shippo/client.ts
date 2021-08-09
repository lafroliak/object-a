import shippo from 'shippo'

export const client = shippo(process.env.SHIPPO_TOKEN!)

export async function rates(id: string): Promise<Shippo.Rate> {
  const res = await fetch(`https://api.goshippo.com/rates/${id}`, {
    headers: {
      Authorization: `ShippoToken ${process.env.SHIPPO_TOKEN!}`,
    },
  })

  return res.json()
}
