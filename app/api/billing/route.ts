import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Convex user to get Stripe customer ID
    const convexUser = await convex.query(api.queries.getUserByClerkId, { clerkId: userId });

    if (!convexUser?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: convexUser.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://mindshift-zeta.vercel.app"}/profile`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create billing portal session", details: message },
      { status: 500 }
    );
  }
}
