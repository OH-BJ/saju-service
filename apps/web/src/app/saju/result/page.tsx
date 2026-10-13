import type { Metadata } from "next";
import { Suspense } from "react";
import { SajuResult } from "@/components/menu/SajuResult";

export const metadata: Metadata = { title: "평생사주 풀이" };

export default function Page() {
  return (
    <Suspense>
      <SajuResult />
    </Suspense>
  );
}
