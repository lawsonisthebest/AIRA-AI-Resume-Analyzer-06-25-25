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
    // 1. Get the user's Stripe customer ID from Firestore
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const stripeCustomerId = userSnap.exists()
      ? userSnap.data().stripeCustomerId
      : null;

    if (stripeCustomerId) {
      console.log(
        `Cancelling subscriptions for user ${userId}, customer: ${stripeCustomerId}`
      );

      // 2. Cancel ALL active subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
        limit: 100,
      });

      console.log(
        `Found ${subscriptions.data.length} active subscriptions to cancel`
      );

      for (const sub of subscriptions.data) {
        try {
          console.log(`Cancelling subscription: ${sub.id}`);
          await stripe.subscriptions.cancel(sub.id);
          console.log(`Successfully cancelled subscription: ${sub.id}`);
        } catch (err) {
          console.error(`Failed to cancel subscription ${sub.id}:`, err);
        }
      }

      // 3. Update Firestore to reflect the cancellation
      await updateDoc(userRef, {
        stripeSubscriptionId: null,
        plan: "Free Plan",
        uploads: 3, // Default free plan uploads
      });

      console.log(
        `Updated user ${userId} to Free Plan after subscription cancellation`
      );
    } else {
      console.log(`No Stripe customer ID found for user ${userId}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error cancelling subscriptions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to cancel subscriptions" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
