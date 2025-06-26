/* eslint-disable */
// lib/uploadLimits.ts
export const planUploadLimits: Record<string, number> = {
  "Free Plan": 5,
  "Pro Plan": 50,
  "Premium Plan": 999,
  Enterprise: -1, // unlimited
  infinite: -1, // unlimited
};

export function isNewMonth(lastReset: Date): boolean {
  const now = new Date();
  return (
    now.getFullYear() !== lastReset.getFullYear() ||
    now.getMonth() !== lastReset.getMonth()
  );
}

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function resetMonthlyCreditsIfNeeded(userId: string) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const now = new Date();
  const lastReset = userData.lastUploadReset?.toDate?.() || new Date(0);

  // If it's a new month, reset credits
  if (
    now.getFullYear() !== lastReset.getFullYear() ||
    now.getMonth() !== lastReset.getMonth()
  ) {
    const plan = userData.plan || "Free Plan";
    const newCredits = planUploadLimits[plan] || 0;

    await updateDoc(userRef, {
      lastUploadReset: now,
      uploads: newCredits,
    });
  }
}
