/* eslint-disable */
import React, { useEffect, useState } from "react";
import { CheckCircle, Star } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  name: string;
  price: number;
  benefits: string[];
  isPopular: boolean;
  uploads: number;
}

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

export async function getUserPlan(userId: string): Promise<string | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data().plan;
  }
  return null;
}

function PricingCard({ name, price, benefits, isPopular, uploads }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useUser();

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

  const handleSubscribe = async () => {
    setLoading(true);
    if (name === "Free Plan") {
      // Cancel all subscriptions before updating to Free Plan
      await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.user?.id }),
      });
      // Directly update Firestore for Free Plan
      const userRef = doc(db, "users", user.user?.id!);
      await updateDoc(userRef, {
        uploads: uploads,
        plan: name,
      });
      setLoading(false);
      router.push("/");
      return;
    }

    try {
      // Only create the checkout session, do not cancel subscriptions here
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceIdForPlan(name),
          plan: name,
          uploads: uploads === Infinity ? -1 : uploads,
          userId: user.user?.id,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        console.error("API Error:", data.error);
        alert(
          "There was an error creating your checkout session. Please try again."
        );
        setLoading(false);
        return;
      }

      // Always redirect to Stripe checkout
      const stripe = await stripePromise;
      if (!stripe) {
        console.error("Stripe failed to load.");
        alert(
          "Payment system is currently unavailable. Please try again later."
        );
        setLoading(false);
        return;
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      if (error) {
        console.error("Stripe redirect error:", error);
        alert("There was an error redirecting to payment. Please try again.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("There was an error processing your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchPlan() {
      if (user.user?.id) {
        const userPlan = await getUserPlan(user.user.id);
        if (userPlan) {
          setPlan(userPlan);
        }
      }
    }
    fetchPlan();
  }, [user.user?.id]);

  const confirmSubscribe = async (uploads: number) => {
    const userRef = doc(db, "users", user.user?.id!);
    await updateDoc(userRef, {
      uploads: uploads,
      plan: name,
    });
    router.push("/");
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-12 w-12 text-white mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-white text-lg font-semibold">
              Processing...
            </span>
          </div>
        </div>
      )}
      <div
        className={`relative ${
          plan === name ? "border-green-400 border-2 z-50" : "border-white/10"
        } bg-zinc-900/80 border rounded-2xl shadow-xl max-w-xs w-full p-8 flex flex-col items-center gap-6 backdrop-blur-md hover:border-white/20 hover:scale-110  transition-all duration-300 `}
      >
        {/* Current Plan badge */}
        {plan === name && (
          <div className="absolute top-0 left-0 flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-tl-lg rounded-br-lg shadow-lg text-xs font-semibold uppercase tracking-wider z-10">
            <CheckCircle className="w-4 h-4 text-white" /> Current Plan
          </div>
        )}
        {/* Featured badge */}
        {isPopular && plan !== name && (
          <div className="absolute top-0 right-0 flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-tr-lg rounded-bl-lg shadow-lg text-xs font-semibold uppercase tracking-wider z-10">
            <Star className="w-4 h-4 text-yellow-300" /> Popular
          </div>
        )}
        {/* Plan Name & Price */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {name}
          </h3>
          {price > 0 && (
            <div className="text-4xl font-extrabold text-blue-400 mt-4">
              ${price - 1}.99
              <span className="text-lg font-medium text-gray-300">/mo</span>
            </div>
          )}
          {price <= 0 && (
            <div className="text-4xl font-extrabold text-blue-400 mt-4">
              $0.00
              <span className="text-lg font-medium text-gray-300">/mo</span>
            </div>
          )}
          <div className="text-sm text-gray-400">
            Billed monthly. Cancel anytime.
          </div>
        </div>
        {/* Features List */}
        <ul className="w-full flex flex-col gap-3 mt-4">
          {benefits.map((benefit) => (
            <li
              className="flex items-center gap-3 text-gray-100 text-base"
              key={benefit}
            >
              <CheckCircle className="text-green-400 w-5 h-5" /> {benefit}
            </li>
          ))}
        </ul>
        {/* Call to Action */}
        <Button
          onClick={handleSubscribe}
          className={`mt-6 w-full py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md transition duration-200 ${
            plan === name
              ? "bg-green-500 cursor-not-allowed opacity-80 hover:from-green-500 hover:to-green-500"
              : "hover:from-blue-600 hover:to-purple-600"
          }`}
          disabled={plan === name}
        >
          {plan === name ? "Current Plan" : "Subscribe"}
        </Button>
      </div>
    </>
  );
}

export default PricingCard;

function priceIdForPlan(planName: string): string {
  switch (planName) {
    case "Free Plan":
      return "";
    case "Pro Plan":
      return "price_1Re0tCA4HLPGvpQYTFTW2KKU";
    case "Enterprise Plan":
      return "price_1Re0tTA4HLPGvpQYtWbJbROy";
    default:
      return "";
  }
}
