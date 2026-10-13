import type { Metadata } from "next";
import { Suspense } from "react";
import { NewyearResult } from "@/components/menu/NewyearResult";

export const metadata: Metadata = { title: "신년운세 풀이" };

export default function Page() {
  return (
    <Suspense>
      <NewyearResult />
    </Suspense>
  );
}
