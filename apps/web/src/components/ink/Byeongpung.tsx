"use client";

import type { Panel } from "@saju/reading";
import { useState } from "react";

const TONE_MARK = ["", "▼", "▽", "·", "○", "◎"] as const;

/**
 * 병풍: 폭마다 간지를 세로로 쓰고, 지그재그로 접혀 있다.
 * 폭을 누르면 아래에 그 시기의 풀이가 펼쳐진다. 폭이 많으면 가로로 넘긴다.
 */
export function Byeongpung({ panels, title }: { panels: Panel[]; title?: string }) {
  const initial = Math.max(0, panels.findIndex((p) => p.current));
  const [open, setOpen] = useState(initial);
  const sel = panels[open];

  return (
    <section className="flex flex-col gap-3">
      {title && <h3 className="font-sans text-[12px] tracking-[0.4em] text-ink-soft">{title}</h3>}
      <div className="no-scrollbar -mx-5 overflow-x-auto px-5">
        <ol className="flex w-max py-2" style={{ perspective: 600 }}>
          {panels.map((p, i) => (
            <li key={i} style={{ margin: "0 -1.4px", transformStyle: "preserve-3d" }}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-pressed={open === i}
                aria-label={`${p.label} ${p.pillar.hangul} 풀이 보기`}
                data-fold={i % 2 ? "even" : "odd"}
                className={`byeong-panel flex h-36 w-12 flex-col items-center justify-between py-2 font-sans text-[11px] ${
                  open === i ? "text-seal" : "text-ink-soft"
                } ${p.current ? "bg-seal-soft!" : ""}`}
                style={{ ["--fold" as string]: open === i ? "6deg" : "22deg", animationDelay: `${0.15 + i * 0.07}s` }}
              >
                <span>{p.label}</span>
                <b className={`font-brush text-xl leading-none font-normal [writing-mode:vertical-rl] ${p.current || open === i ? "text-seal" : "text-ink"}`}>
                  {p.pillar.hanja}
                </b>
                <span aria-hidden="true">{TONE_MARK[p.tone]}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <p className="-mt-1 font-sans text-[11px] text-ink-soft">◎ 아주 순함 / ○ 순함 / · 보통 / ▽ 조심 / ▼ 많이 조심</p>
      {sel && (
        <div key={open} className="ink-in border-t border-ink/20 pt-3">
          <p className="font-sans text-[13px] text-ink-soft">
            {sel.label} · {sel.pillar.hanja}({sel.pillar.hangul}) · {sel.caption}
          </p>
          <p className="mt-1 text-[16px] leading-7 text-ink-2">{sel.text}</p>
        </div>
      )}
    </section>
  );
}
