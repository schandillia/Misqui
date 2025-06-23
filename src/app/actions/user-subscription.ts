"use server"

import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { absoluteUrl } from "@/lib/utils"
import { getUserSubscription } from "@/db/queries"
import { logger } from "@/lib/logger"
import subscription from "@/lib/data/subscription.json"

const returnUrl = absoluteUrl("/store")

// Define response type for consistency
type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: number
    message: string
  }
}

export async function createStripeUrl(): Promise<ActionResponse<string>> {
  const session = await auth()
  try {
    if (!session?.user?.id) {
      logger.error("Unauthorized access attempted for Stripe URL creation")
      return {
        success: false,
        error: { code: 401, message: "Unauthorized: Please log in" },
      }
    }

    if (!session.user.email) {
      logger.error("User email missing for Stripe checkout", {
        userId: session.user.id,
      })
      return {
        success: false,
        error: { code: 400, message: "User email is required for checkout" },
      }
    }

    const userId = session.user.id
    const userSubscription = userId ? await getUserSubscription(userId) : null

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: returnUrl,
      })

      if (!stripeSession.url) {
        logger.error("Stripe billing portal session URL is missing", { userId })
        return {
          success: false,
          error: { code: 500, message: "Failed to create billing portal URL" },
        }
      }

      return { success: true, data: stripeSession.url }
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: session.user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: subscription.SUBSCRIPTION_CURRENCY,
            product_data: {
              name: subscription.SUBSCRIPTION_PRODUCT,
              description: subscription.SUBSCRIPTION_DESCRIPTION,
            },
            unit_amount: subscription.SUBSCRIPTION_AMOUNT,
            recurring: {
              interval: subscription.SUBSCRIPTION_FREQUENCY as
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

    if (!stripeSession.url) {
      logger.error("Stripe checkout session URL is missing", { userId })
      return {
        success: false,
        error: { code: 500, message: "Failed to create checkout URL" },
      }
    }

    return { success: true, data: stripeSession.url }
  } catch (error) {
    logger.error("Error creating Stripe URL", {
      error,
      userId: session?.user?.id,
    })
    return {
      success: false,
      error: { code: 500, message: "Failed to create Stripe URL" },
    }
  }
}
