/* eslint-disable */
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);

export async function POST(req: Request) {
  const { priceId, plan, uploads, userId } = await req.json();
  if (!priceId || !userId) {
    return new Response(
      JSON.stringify({ error: "Missing priceId or userId" }),
      { status: 400 }
    );
  }

  // 1. Get the user's Stripe customer ID from Firestore
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  let stripeCustomerId = userSnap.exists()
    ? userSnap.data().stripeCustomerId
    : null;

  // 2. Ensure a single Stripe customer per user, with fallback if customer is missing
  let customerExists = true;
  if (stripeCustomerId) {
    try {
      await stripe.customers.retrieve(stripeCustomerId);
    } catch (err: any) {
      if (err.code === "resource_missing") {
        customerExists = false;
      } else {
        throw err;
      }
    }
  } else {
    customerExists = false;
  }

  if (!customerExists) {
    // Create a new Stripe customer and store the ID
    const customer = await stripe.customers.create({
      metadata: { userId },
    });
    stripeCustomerId = customer.id;
    await updateDoc(userRef, { stripeCustomerId });
  } else {
    // Ensure the stripeCustomerId is stored in Firestore even if it exists
    await updateDoc(userRef, { stripeCustomerId });
  }

  // 4. Always create a checkout session, but store information about existing subscription
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
    limit: 1,
  });

  const hasExistingSubscription = subscriptions.data.length > 0;
  const existingSubscriptionId = hasExistingSubscription
    ? subscriptions.data[0].id
    : null;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/success?plan=${encodeURIComponent(plan)}&uploads=${uploads}`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/cancel`,
      client_reference_id: userId,
      metadata: {
        plan: plan,
        uploads: uploads.toString(),
        hasExistingSubscription: hasExistingSubscription.toString(),
        existingSubscriptionId: existingSubscriptionId || "",
      },
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    if (err.code === "resource_missing" && err.param === "customer") {
      // Customer is missing, create a new one and retry
      const customer = await stripe.customers.create({
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await updateDoc(userRef, { stripeCustomerId });

      // Retry session creation
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer: stripeCustomerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/success?plan=${encodeURIComponent(plan)}&uploads=${uploads}`,
        cancel_url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/cancel`,
        client_reference_id: userId,
        metadata: {
          plan: plan,
          uploads: uploads.toString(),
          hasExistingSubscription: hasExistingSubscription.toString(),
          existingSubscriptionId: existingSubscriptionId || "",
        },
      });

      return new Response(JSON.stringify({ sessionId: session.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Unknown error, rethrow
      throw err;
    }
  }
}
