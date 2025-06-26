/* eslint-disable */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function updateUserTokens(userId: string) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const uploads = userSnap.data().uploads;
    if (uploads === -1) return; // Don't decrement for unlimited
  }
  await updateDoc(userRef, {
    uploads: increment(-1),
  });
}

export async function getUserTokens(userId: string): Promise<number | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data().uploads;
  }
  return null;
}

export async function fetchAllResumes(userId: string) {
  const q = query(collection(db, "resumes"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return results;
}
