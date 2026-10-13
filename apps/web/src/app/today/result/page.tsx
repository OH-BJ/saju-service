import type { Metadata } from "next";
import { Suspense } from "react";
import { TodayResult } from "@/components/menu/TodayResult";

export const metadata: Metadata = { title: "오늘의 운세" };

export default function Page() {
  return (
    <Suspense>
      <TodayResult />
    </Suspense>
  );
}
