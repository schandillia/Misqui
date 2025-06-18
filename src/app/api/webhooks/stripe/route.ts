import { db, initializeDb } from "@/db/drizzle"
import { userSubscription } from "@/db/schema"
import { stripe } from "@/lib/stripe"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  await initializeDb()
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
      logger.info("Inserted user subscription for checkout session", {
        userId: session.metadata.userId,
        subscriptionId: subscription.id,
      })
    } catch (error) {
      logger.error("Error inserting user subscription", {
        userId: session.metadata.userId,
        error,
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
      logger.error("No subscription found in invoice", { eventId: event.id })
      return new NextResponse("No subscription found in invoice", {
        status: 400,
      })
    }
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription
    )

    try {
      await db.instance
        .update(userSubscription)
        .set({
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.items.data[0].current_period_end * 1000
          ),
        })
        .where(eq(userSubscription.stripeSubscriptionId, subscription.id))
      logger.info("Updated user subscription for invoice payment", {
        subscriptionId: subscription.id,
      })
    } catch (error) {
      logger.error("Error updating user subscription", {
        subscriptionId: subscription.id,
        error,
      })
      return new NextResponse("Failed to process invoice payment", {
        status: 500,
      })
    }
  }

  return new NextResponse(null, { status: 200 })
}
