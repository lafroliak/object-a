import Stripe from 'stripe'

/* eslint-disable */
console.log(process.env.STRIPE_SECRET_KEY)

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27',
})
