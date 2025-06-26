/* eslint-disable */
"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const user = useUser();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (user.user?.id) {
      const plan = params.get("plan") || "Pro Plan";
      const uploads = Number(params.get("uploads")) || 10;

      fetch("/api/confirm-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.user.id,
          plan,
          uploads,
        }),
      })
        .then(() => {
          router.push("/");
        })
        .catch((error) => {
          console.error("Error updating subscription:", error);
          router.push("/");
        });
    }
  }, [user.user?.id, params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="text-center">
        <div className="text-4xl font-bold text-green-400 mb-4">✓</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Subscription Successful!
        </h1>
        <p className="text-gray-300">Updating your account...</p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
