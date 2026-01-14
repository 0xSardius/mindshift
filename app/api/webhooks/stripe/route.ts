import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkId = session.metadata?.clerkId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!clerkId) {
          console.error("No clerkId in session metadata");
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subData = subscription as any;

        await convex.mutation(api.mutations.updateSubscription, {
          clerkId,
          tier: "pro",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: subData.status,
          subscriptionEndsAt: subData.current_period_end * 1000,
        });

        console.log(`User ${clerkId} upgraded to Pro`);
        break;
      }

      case "customer.subscription.updated": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;
        const clerkId = subscription.metadata?.clerkId;

        if (!clerkId) {
          console.error("No clerkId in subscription metadata");
          break;
        }

        // Determine tier based on subscription status
        // "trialing" and "active" both get Pro access
        const tier = subscription.status === "active" || subscription.status === "trialing" ? "pro" : "free";

        await convex.mutation(api.mutations.updateSubscription, {
          clerkId,
          tier,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionEndsAt: subscription.current_period_end * 1000,
        });

        console.log(`User ${clerkId} subscription updated: ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;
        const clerkId = subscription.metadata?.clerkId;

        if (!clerkId) {
          console.error("No clerkId in subscription metadata");
          break;
        }

        await convex.mutation(api.mutations.updateSubscription, {
          clerkId,
          tier: "free",
          subscriptionStatus: "canceled",
          subscriptionEndsAt: subscription.current_period_end * 1000,
        });

        console.log(`User ${clerkId} subscription canceled, downgraded to Free`);
        break;
      }

      case "invoice.payment_failed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subData = subscription as any;
          const clerkId = subData.metadata?.clerkId;

          if (clerkId) {
            await convex.mutation(api.mutations.updateSubscription, {
              clerkId,
              tier: "pro", // Keep Pro but mark status
              subscriptionStatus: "past_due",
            });

            console.log(`User ${clerkId} payment failed, marked past_due`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
