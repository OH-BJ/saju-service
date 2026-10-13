"use client";

import { useState } from "react";
import { renderCard, shareOrSave, type CardData } from "@/lib/shareCard";

/** 결과를 한지 카드 이미지로 저장하거나 공유한다 */
export function ShareCardButton({ data, filename, label = "명식 카드 저장" }: { data: CardData; filename: string; label?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  const run = async () => {
    setState("busy");
    try {
      const blob = await renderCard(data);
      const how = await shareOrSave(blob, filename, "묵연");
      setState("done");
      void how;
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={state === "busy"}
        className="flex items-center gap-2 rounded-full border border-ink px-5 py-2 font-sans text-sm tracking-[0.1em] hover:bg-ink hover:text-hanji disabled:opacity-50"
      >
        <span className="font-brush text-lg leading-none text-seal">印</span>
        {state === "busy" ? "그리는 중…" : state === "done" ? "저장했어요" : label}
      </button>
      {state === "error" && <span className="font-sans text-xs text-seal">이미지를 만들지 못했습니다. 다시 눌러 주세요.</span>}
    </div>
  );
}
