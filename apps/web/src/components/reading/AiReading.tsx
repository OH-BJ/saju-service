"use client";

import type { AiRequest } from "@saju/reading";
import { useEffect, useRef, useState } from "react";

const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED !== "0";

type State = { status: "idle" } | { status: "streaming"; text: string } | { status: "done"; text: string } | { status: "error"; message: string };

const ERRORS: Record<string, string> = {
  "no-key": "AI 풀이가 아직 연결되지 않았습니다. 위의 기본 풀이를 참고해 주세요.",
  "rate-limit": "요청이 잦아 잠시 쉬어 갑니다. 1분 뒤에 다시 눌러 주세요.",
  quota: "오늘 AI 풀이 사용량이 다 찼습니다. 내일 다시 찾아 주세요.",
};

/** Gemini가 근거를 받아 다시 쓴 풀이. 누르면 스트리밍으로 받아 붓글씨처럼 이어 쓴다 */
export function AiReading({ request, label = "붓으로 다시 쓴 풀이" }: { request: AiRequest; label?: string }) {
  const [state, setState] = useState<State>({ status: "idle" });
  const ctrl = useRef<AbortController | null>(null);
  useEffect(() => () => ctrl.current?.abort(), []);

  if (!AI_ENABLED) return null;

  const start = async () => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setState({ status: "streaming", text: "" });
    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: c.signal,
      });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setState({ status: "error", message: ERRORS[err.error ?? ""] ?? "풀이를 받아 오지 못했습니다. 잠시 뒤 다시 시도해 주세요." });
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        setState({ status: "streaming", text });
      }
      setState({ status: "done", text });
    } catch (e) {
      if (!c.signal.aborted) setState({ status: "error", message: "연결이 끊겼습니다. 다시 시도해 주세요." });
      void e;
    }
  };

  return (
    <section className="hanji-sheet mt-6 rounded-sm px-5 py-6" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-baseline gap-2 text-[18px] font-bold">
          <span className="font-brush text-2xl font-normal text-seal">筆</span>
          {label}
        </h2>
        {state.status !== "streaming" && (
          <button type="button" onClick={start} className="rounded-full border border-ink px-4 py-1.5 font-sans text-[13px] tracking-[0.15em] hover:bg-ink hover:text-hanji">
            {state.status === "idle" ? "풀이 받기" : "다시 쓰기"}
          </button>
        )}
      </div>
      {state.status === "idle" && (
        <p className="mt-2 font-sans text-[14px] leading-6 text-ink-soft">
          위의 근거만 AI(Gemini)에게 넘겨 한 편의 글로 다시 씁니다. 이름과 생년월일은 보내지 않습니다.
        </p>
      )}
      {(state.status === "streaming" || state.status === "done") && (
        <div className="mt-4 flex flex-col gap-3 text-[16px] leading-8 text-ink-2">
          {state.text
            .split(/\n{2,}|\n/)
            .filter(Boolean)
            .map((p, i) => (
              <p key={i} className="ink-in">
                {p}
              </p>
            ))}
          {state.status === "streaming" && <span className="inline-block h-4 w-1.5 animate-pulse bg-ink/60" aria-hidden="true" />}
        </div>
      )}
      {state.status === "error" && <p className="mt-3 font-sans text-[15px] text-seal">{state.message}</p>}
    </section>
  );
}
