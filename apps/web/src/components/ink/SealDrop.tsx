"use client";

import { BRANCHES, STEMS, type Pillars, type PillarKey } from "@saju/engine";
import { useEffect, useState } from "react";
import { Seal3D } from "./Seal3D";

const ORDER: PillarKey[] = ["hour", "day", "month", "year"];
const LABEL: Record<PillarKey, string> = { hour: "時", day: "日", month: "月", year: "年" };
const DURATION = 6200;

/**
 * 대표 전환 장면: 비스듬히 놓인 한지 위로 돌 인장이 돌며 떨어져 일간 자리에 찍히고,
 * 종이가 정면으로 일어서며 나머지 일곱 글자가 붓으로 쓰인다. 누르면 건너뛴다.
 */
export function SealDrop({ pillars, caption, onDone }: { pillars: Pillars; caption: string; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }
    const t1 = setTimeout(() => setLeaving(true), DURATION);
    const t2 = setTimeout(onDone, DURATION + 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  let brushIdx = 0;
  return (
    <div
      className={`fixed inset-0 z-50 flex cursor-pointer flex-col items-center bg-hanji transition-opacity duration-500 ${leaving ? "opacity-0" : ""}`}
      style={{ backgroundImage: "inherit" }}
      onClick={onDone}
      role="dialog"
      aria-label="명식을 새기는 중. 누르면 건너뜁니다."
    >
      <div className="relative mt-[12vh] h-6 w-full text-center font-sans text-xs tracking-[0.35em] text-ink-soft">
        <span className="drop-cap-a absolute inset-x-0">인장을 새기는 중</span>
        <span className="drop-cap-b absolute inset-x-0">{caption}</span>
      </div>
      <div className="relative w-full max-w-sm flex-1" style={{ perspective: 720, perspectiveOrigin: "50% 20%" }}>
        <div className="drop-table absolute inset-x-4 top-16" style={{ transformStyle: "preserve-3d" }}>
          <div className="hanji-sheet px-2 pt-5 pb-4" style={{ transformStyle: "preserve-3d" }}>
            <div className="grid grid-cols-4 text-center" style={{ transformStyle: "preserve-3d" }}>
              {ORDER.map((k) => {
                const p = pillars[k];
                const stemDelay = 4.4 + brushIdx++ * 0.15;
                const branchDelay = 4.4 + brushIdx++ * 0.15;
                return (
                  <div key={k} className="flex flex-col items-center" style={{ transformStyle: "preserve-3d" }}>
                    <div className="relative grid size-12 place-items-center font-brush text-[40px] leading-none" style={{ transformStyle: "preserve-3d" }}>
                      {k === "day" ? (
                        <>
                          <span className="drop-imprint seal-mark absolute inset-0 grid place-items-center">{p ? STEMS[p.stem] : ""}</span>
                          <span className="drop-ripple absolute -inset-8 rounded-full border-2 border-seal/40" />
                          <span className="drop-shadow absolute -inset-1.5 rounded-lg" />
                          <span className="absolute top-px left-px" style={{ transformStyle: "preserve-3d" }}>
                            <Seal3D className="drop-fall" />
                          </span>
                        </>
                      ) : (
                        <span className="brush" style={{ animationDelay: `${stemDelay}s` }}>
                          {p ? STEMS[p.stem] : "?"}
                        </span>
                      )}
                    </div>
                    <div className="grid size-12 place-items-center font-brush text-[40px] leading-none">
                      <span className="brush" style={{ animationDelay: `${branchDelay}s` }}>
                        {p ? BRANCHES[p.branch] : "?"}
                      </span>
                    </div>
                    <span className="mt-1.5 w-3/4 border-t border-ink pt-0.5 font-sans text-[10px] tracking-[0.2em] text-ink-soft">{LABEL[k]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <p className="mb-10 font-sans text-[11px] text-ink-soft">화면을 누르면 건너뜁니다</p>
    </div>
  );
}
