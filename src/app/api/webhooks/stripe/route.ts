import { db, initializeDb } from "@/db/drizzle"
import { userSubscription } from "@/db/schema"
import { stripe } from "@/lib/stripe"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import Stripe from "stripe"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  await initializeDb() // Keep for Edge Runtime compatibility

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    logger.error("Webhook signature verification failed", {
      error: errorMessage,
      module: "stripe-webhook",
    })
    return new NextResponse(`Webhook error: ${errorMessage}`, {
      status: 400,
    })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )
    if (!session?.metadata?.userId) {
      logger.error("User ID missing in checkout session metadata", {
        eventId: event.id,
        module: "stripe-webhook",
      })
      return new NextResponse("User ID is required", { status: 400 })
    }

    try {
      await db.instance.insert(userSubscription).values({
        userId: session.metadata.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000
        ),
      })
      // Invalidate cache for getUserSubscription
      revalidateTag(`subscription-${session.metadata.userId}`)
      logger.info("Inserted user subscription and invalidated cache", {
        userId: session.metadata.userId,
        subscriptionId: subscription.id,
        module: "stripe-webhook",
      })
    } catch (error) {
      logger.error("Error inserting user subscription", {
        userId: session.metadata.userId,
        error,
        module: "stripe-webhook",
      })
      return new NextResponse("Failed to process checkout session", {
        status: 500,
      })
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice & {
      subscription: string
    }
    if (!invoice.subscription) {
      logger.error("No subscription found in invoice", {
        eventId: event.id,
        module: "stripe-webhook",
      })
      return new NextResponse("No subscription found in invoice", {
        status: 400,
      })
    }
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription
    )

    try {
      const [updatedSubscription] = await db.instance
        .update(userSubscription)
        .set({
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.items.data[0].current_period_end * 1000
          ),
        })
        .where(eq(userSubscription.stripeSubscriptionId, subscription.id))
        .returning({ userId: userSubscription.userId })

      if (!updatedSubscription) {
        logger.error("No subscription found to update", {
          subscriptionId: subscription.id,
          module: "stripe-webhook",
        })
        return new NextResponse("No subscription found to update", {
          status: 400,
        })
      }

      // Invalidate cache for getUserSubscription
      revalidateTag(`subscription-${updatedSubscription.userId}`)
      logger.info("Updated user subscription and invalidated cache", {
        userId: updatedSubscription.userId,
        subscriptionId: subscription.id,
        module: "stripe-webhook",
      })
    } catch (error) {
      logger.error("Error updating user subscription", {
        subscriptionId: subscription.id,
        error,
        module: "stripe-webhook",
      })
      return new NextResponse("Failed to process invoice payment", {
        status: 500,
      })
    }
  }

  return new NextResponse(null, { status: 200 })
}

// Ensure Edge Runtime compatibility
export const runtime = "edge"
