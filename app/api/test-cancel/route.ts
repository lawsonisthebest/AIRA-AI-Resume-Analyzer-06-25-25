/* eslint-disable */
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing userId parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get user info from Firestore
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userData = userSnap.data();
    const stripeCustomerId = userData.stripeCustomerId;
    const currentPlan = userData.plan;
    const currentSubscriptionId = userData.stripeSubscriptionId;

    if (!stripeCustomerId) {
      return new Response(
        JSON.stringify({
          message: "No Stripe customer ID found",
          userData: {
            plan: currentPlan,
            subscriptionId: currentSubscriptionId,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 100,
    });

    const subscriptionDetails = subscriptions.data.map((sub) => ({
      id: sub.id,
      status: sub.status,
      items: sub.items.data.map((item) => ({
        price_id: item.price.id,
        quantity: item.quantity,
      })),
    }));

    return new Response(
      JSON.stringify({
        userData: {
          plan: currentPlan,
          subscriptionId: currentSubscriptionId,
          customerId: stripeCustomerId,
        },
        subscriptions: subscriptionDetails,
        totalSubscriptions: subscriptions.data.length,
        activeSubscriptions: subscriptions.data.filter(
          (sub) => sub.status === "active"
        ).length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in test cancel endpoint:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get subscription info" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
