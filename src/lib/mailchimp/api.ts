import mailchimp, { Status } from '@mailchimp/mailchimp_marketing'

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_SERVER,
})

export async function subscribe(email: string) {
  if (!email) {
    return null
  }

  try {
    await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID!, {
      email_address: email,
      status: 'subscribed' as Status.subscribed,
    })

    return true
  } catch (err) {
    throw new Error(err.message)
  }
}
