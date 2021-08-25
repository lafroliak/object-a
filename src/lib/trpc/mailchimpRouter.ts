import { z } from 'zod'
import { subscribe } from '~lib/mailchimp/api'
import { createRouter } from '~pages/api/trpc/[trpc]'

export const mailchimpRouter = createRouter().mutation('subscribe', {
  input: z.string(),
  async resolve({ input }) {
    await subscribe(input)

    return 'Success! You are now subscribed to the newsletter'
  },
})
