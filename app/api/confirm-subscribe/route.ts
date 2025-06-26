/* eslint-disable */
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  const { userId, plan, uploads } = await req.json();
  if (!userId || !plan) {
    return NextResponse.json(
      { error: "Missing userId or plan" },
      { status: 400 }
    );
  }
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    uploads: uploads,
    plan: plan,
  });
  return NextResponse.json({ success: true });
}
