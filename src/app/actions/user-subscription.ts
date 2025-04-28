"use server"

import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { absoluteUrl } from "@/lib/utils"
import { getUserSubscription } from "@/db/queries"

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
          currency: "INR",
          product_data: {
            name: "Misqui Pro",
            description: "Unlimited gems",
          },
          unit_amount: 20000, // 20 INR
          recurring: {
            interval: "month",
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
