/* eslint-disable */
"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function CancelPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900"></div>
  );
}
