import type { Metadata } from "next";
import { Suspense } from "react";
import { GunghapResult } from "@/components/menu/GunghapResult";

export const metadata: Metadata = { title: "궁합 풀이" };

export default function Page() {
  return (
    <Suspense>
      <GunghapResult />
    </Suspense>
  );
}
