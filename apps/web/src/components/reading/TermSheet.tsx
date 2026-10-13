"use client";

import { GLOSSARY } from "@saju/reading";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const TermCtx = createContext<(term: string) => void>(() => {});
export const useTerm = () => useContext(TermCtx);

/** 용어 설명 시트. 근거 칩을 누르면 아래에서 한지 쪽지가 올라온다 */
export function TermProvider({ children }: { children: React.ReactNode }) {
  const [term, setTerm] = useState<string | null>(null);
  const open = useCallback((t: string) => setTerm(t), []);
  const entry = term ? GLOSSARY.find((g) => g.term === term || g.term.includes(term)) : null;

  useEffect(() => {
    if (!term) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setTerm(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [term]);

  return (
    <TermCtx.Provider value={open}>
      {children}
      {term && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/25" onClick={() => setTerm(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="term-title"
            className="hanji-sheet ink-in mb-0 w-full max-w-xl rounded-t-lg px-6 pt-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline justify-between">
              <h2 id="term-title" className="flex items-baseline gap-2 text-lg font-bold">
                {entry?.hanja && <span className="font-brush text-2xl font-normal">{entry.hanja}</span>}
                {entry?.term ?? term}
              </h2>
              <button type="button" className="font-sans text-sm text-ink-soft" onClick={() => setTerm(null)} autoFocus>
                닫기
              </button>
            </div>
            <p className="mt-3 text-[15px] leading-7 text-ink-2">{entry?.body ?? "아직 설명을 준비하지 못한 용어입니다."}</p>
          </div>
        </div>
      )}
    </TermCtx.Provider>
  );
}
