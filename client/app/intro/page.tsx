"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import OpeningAnimation from "@/components/intro/OpeningAnimation";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    const played = sessionStorage.getItem("trishul_intro_played");
    if (played === "true") {
      router.replace("/login");
    }
  }, [router]);

  return <OpeningAnimation onComplete={() => router.push("/login")} />;
}
