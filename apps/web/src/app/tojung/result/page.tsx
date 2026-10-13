import type { Metadata } from "next";
import { Suspense } from "react";
import { TojungResult } from "@/components/menu/TojungResult";

export const metadata: Metadata = { title: "토정비결 풀이" };

export default function Page() {
  return (
    <Suspense>
      <TojungResult />
    </Suspense>
  );
}
