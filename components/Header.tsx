/* eslint-disable */
"use client";

import React, { useState } from "react";
import {
  Bookmark,
  DollarSign,
  FileText,
  Home,
  User,
  UserCircle,
  UserRoundX,
  Crown,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // your firebase setup
import {
  SignInButton,
  SignedIn,
  SignedOut,
  SignOutButton,
} from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [userPlan, setUserPlan] = useState<string | null>(null);

  const goToPage = (pgName: string) => {
    router.push(`/${pgName}`);
  };

  useEffect(() => {
    if (!isLoaded || !user) return;
    const userRef = doc(db, "users", user.id);
    let unsubscribe: (() => void) | undefined;

    const createUserDoc = async () => {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
          plan: "Free Plan",
          uploads: 3,
          createdAt: new Date(),
        });
        setUserPlan("Free Plan");
      }
    };

    createUserDoc();

    // Listen for real-time updates to the user's plan
    unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserPlan(userData.plan || "Free Plan");
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isLoaded]);

  // Function to get plan display info
  const getPlanDisplay = (plan: string | null) => {
    if (!plan || plan === "Free Plan") return null;

    const isPro = plan === "Pro Plan";
    const isEnterprise = plan === "Enterprise Plan";

    if (!isPro && !isEnterprise) return null;

    return {
      text: isPro ? "Pro" : "Enterprise",
      icon: isPro ? <Crown className="w-4 h-4" /> : <Zap className="w-4 h-4" />,
      bgColor: isPro
        ? "bg-gradient-to-r from-purple-500 to-pink-500"
        : "bg-gradient-to-r from-blue-500 to-cyan-600",
      textColor: "text-white",
    };
  };

  const planDisplay = getPlanDisplay(userPlan);

  return (
    <div className="bg-transparent w-full p-6 mx-auto text-white flex justify-between items-center mb-4 absolute">
      <div className="flex space-x-4">
        <Button
          onClick={() => {
            goToPage("");
          }}
          className="headerBtn"
        >
          <Home />
          Home
        </Button>
        <Button
          onClick={() => {
            goToPage("collection");
          }}
          className="headerBtn"
        >
          <Bookmark />
          Collection
        </Button>
        <Button
          onClick={() => {
            goToPage("analyze");
          }}
          className="headerBtn"
        >
          <FileText />
          Analyze
        </Button>
        <Button
          onClick={() => {
            goToPage("pricing");
          }}
          className="headerBtn"
        >
          <DollarSign />
          Pricing
        </Button>
      </div>

      {/* Plan Display Section */}
      <div className="flex items-center space-x-4">
        {planDisplay && (
          <Button
            onClick={() => {
              router.push("/pricing");
            }}
            className={`flex items-center gap-2 px-3 rounded-lg ${planDisplay.bgColor} ${planDisplay.textColor} text-sm font-bold shadow-lg`}
          >
            {planDisplay.icon}
            <span>{planDisplay.text}</span>
          </Button>
        )}

        <SignedOut>
          <SignInButton>
            <Button className="headerBtn">
              <User />
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <SignOutButton>
            <Button className="headerBtn">
              <UserRoundX />
              Sign Out
            </Button>
          </SignOutButton>
        </SignedIn>
      </div>
    </div>
  );
}
