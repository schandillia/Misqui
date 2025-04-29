"use server"

import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { absoluteUrl } from "@/lib/utils"
import { getUserSubscription } from "@/db/queries"
import brand from "@/lib/data/brand.json"

const returnUrl = absoluteUrl("/store")

export const createStripeUrl = async () => {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId = session.user.id

  const userSubscription = await getUserSubscription()

  if (userSubscription && userSubscription.stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      return_url: returnUrl,
    })

    return { data: stripeSession.url }
  }

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: session.user.email!,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: brand.SUBSCRIPTION_CURRENCY,
          product_data: {
            name: brand.SUBSCRIPTION_PRODUCT,
            description: brand.SUBSCRIPTION_DESCRIPTION,
          },
          unit_amount: Number(brand.SUBSCRIPTION_AMOUNT),
          recurring: {
            interval: brand.SUBSCRIPTION_FREQUENCY as
              | "day"
              | "week"
              | "month"
              | "year",
          },
        },
      },
    ],
    metadata: {
      userId,
    },
    success_url: returnUrl,
    cancel_url: returnUrl,
  })

  return { data: stripeSession.url }
}
