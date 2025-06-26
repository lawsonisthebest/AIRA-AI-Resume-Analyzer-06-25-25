/* eslint-disable */
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing userId" }), {
      status: 400,
    });
  }

  try {
    console.log(`Force cancelling all subscriptions for user: ${userId}`);

    // 1. Get the user's Stripe customer ID from Firestore
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const stripeCustomerId = userSnap.exists()
      ? userSnap.data().stripeCustomerId
      : null;

    if (!stripeCustomerId) {
      console.log(`No Stripe customer ID found for user ${userId}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "No subscriptions to cancel",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Get ALL subscriptions for this customer (active, past_due, etc.)
    const allSubscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 100,
    });

    console.log(
      `Found ${allSubscriptions.data.length} total subscriptions for customer ${stripeCustomerId}`
    );

    const cancelledSubscriptions = [];
    const failedCancellations = [];

    // 3. Cancel all subscriptions regardless of status
    for (const subscription of allSubscriptions.data) {
      try {
        console.log(
          `Force cancelling subscription: ${subscription.id} (status: ${subscription.status})`
        );

        // Cancel the subscription
        await stripe.subscriptions.cancel(subscription.id);
        cancelledSubscriptions.push(subscription.id);
        console.log(`Successfully cancelled subscription: ${subscription.id}`);
      } catch (err) {
        console.error(`Failed to cancel subscription ${subscription.id}:`, err);
        failedCancellations.push({ id: subscription.id, error: err });
      }
    }

    // 4. Update Firestore to reflect the cancellations
    await updateDoc(userRef, {
      stripeSubscriptionId: null,
      plan: "Free Plan",
      uploads: 3, // Default free plan uploads
    });

    console.log(`Updated user ${userId} to Free Plan after force cancellation`);

    return new Response(
      JSON.stringify({
        success: true,
        cancelledCount: cancelledSubscriptions.length,
        failedCount: failedCancellations.length,
        cancelledSubscriptions,
        failedCancellations,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in force cancel subscriptions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to cancel subscriptions" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
