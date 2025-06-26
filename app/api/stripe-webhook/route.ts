/* eslint-disable */
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const buf = await req.arrayBuffer();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const userId = session.client_reference_id as string;

    if (userId && subscriptionId) {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      console.log(
        `Processing checkout completion for user ${userId}, new subscription: ${subscriptionId}`
      );

      // Always check for and cancel any existing subscriptions for this customer
      try {
        const existingSubscriptions = await stripe.subscriptions.list({
          customer: customerId,
          limit: 100,
        });

        // Cancel all active subscriptions except the new one
        for (const existingSub of existingSubscriptions.data) {
          if (existingSub.id !== subscriptionId) {
            try {
              console.log(
                `Cancelling existing subscription: ${existingSub.id}`
              );
              await stripe.subscriptions.cancel(existingSub.id);
              console.log(
                `Successfully cancelled subscription: ${existingSub.id}`
              );
            } catch (cancelErr) {
              console.error(
                `Failed to cancel subscription ${existingSub.id}:`,
                cancelErr
              );
            }
          }
        }
      } catch (listErr) {
        console.error("Error listing existing subscriptions:", listErr);
      }

      // Also check Firestore for any stored subscription ID and cancel it if different
      if (userSnap.exists()) {
        const storedSubId = userSnap.data().stripeSubscriptionId;
        if (storedSubId && storedSubId !== subscriptionId) {
          try {
            console.log(`Cancelling stored subscription: ${storedSubId}`);
            await stripe.subscriptions.cancel(storedSubId);
            console.log(
              `Successfully cancelled stored subscription: ${storedSubId}`
            );
          } catch (err) {
            console.error(
              `Failed to cancel stored subscription ${storedSubId}:`,
              err
            );
          }
        }
      }

      // Get subscription details to update plan information
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const plan =
        session.metadata?.plan || subscription.metadata?.plan || "Pro Plan";
      const uploads = parseInt(
        session.metadata?.uploads || subscription.metadata?.uploads || "10"
      );

      // Update Firestore with new subscription details
      await updateDoc(userRef, {
        stripeSubscriptionId: subscriptionId,
        plan: plan,
        uploads: uploads,
      });

      console.log(
        `Successfully updated user ${userId} to plan: ${plan} with ${uploads} uploads, subscription: ${subscriptionId}`
      );
    }
  }

  // Handle subscription updates (when user changes plans)
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    console.log(
      `Subscription updated: ${subscription.id} for customer: ${customerId}`
    );

    // Find user by customer ID and update their plan
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("stripeCustomerId", "==", customerId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const plan = subscription.metadata?.plan || "Pro Plan";
        const uploads = parseInt(subscription.metadata?.uploads || "10");

        await updateDoc(userDoc.ref, {
          plan: plan,
          uploads: uploads,
        });

        console.log(
          `Updated user ${userDoc.id} plan to: ${plan} with ${uploads} uploads`
        );
      }
    } catch (err) {
      console.error("Error updating user plan from subscription update:", err);
    }
  }

  // Handle subscription cancellations
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    console.log(
      `Subscription deleted: ${subscription.id} for customer: ${customerId}`
    );

    // Find user by customer ID and update their plan to Free
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("stripeCustomerId", "==", customerId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];

        await updateDoc(userDoc.ref, {
          plan: "Free Plan",
          uploads: 3, // Default free plan uploads
        });

        console.log(
          `Updated user ${userDoc.id} to Free Plan after subscription deletion`
        );
      }
    } catch (err) {
      console.error(
        "Error updating user to Free Plan after subscription deletion:",
        err
      );
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
