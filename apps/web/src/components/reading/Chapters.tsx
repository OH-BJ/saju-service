"use client";

import type { Chapter, Evidence } from "@saju/reading";
import { useTerm } from "./TermSheet";

const NUMERALS = ["壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖", "拾", "拾壹", "拾貳"];

const TONE_CLS: Record<NonNullable<Evidence["tone"]>, string> = {
  good: "border-el-wood/50 text-el-wood",
  caution: "border-seal/50 text-seal",
  neutral: "border-ink/25 text-ink-2",
};

export function EvidenceChip({ e }: { e: Evidence }) {
  const open = useTerm();
  const cls = `inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-sans text-[12px] ${TONE_CLS[e.tone ?? "neutral"]}`;
  if (!e.term) return <span className={cls}>{e.label}</span>;
  return (
    <button type="button" className={`${cls} hover:bg-ink/5`} onClick={() => open(e.term!)} aria-label={`${e.label} — ${e.term} 뜻 보기`}>
      {e.label}
      <span aria-hidden="true" className="text-ink-faint">
        ?
      </span>
    </button>
  );
}

/** 장(章)별 해석. 장 번호는 한자 서수, 근거 칩을 누르면 용어 설명 */
export function Chapters({ chapters, start = 0 }: { chapters: Chapter[]; start?: number }) {
  return (
    <div className="flex flex-col">
      {chapters.map((c, i) => (
        <section key={c.key} className="ink-in grid grid-cols-[2rem_1fr] gap-x-3 border-t border-ink/20 py-5" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
          <span className="font-brush text-xl leading-7 text-seal" aria-hidden="true">
            {NUMERALS[start + i]}
          </span>
          <div className="min-w-0">
            <h2 className="text-[18px] leading-7 font-bold text-balance">{c.title}</h2>
            <div className="mt-2 flex flex-col gap-3 text-[16px] leading-7 text-ink-2">
              {c.body.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
            {c.evidence.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5" aria-label="근거">
                {c.evidence.map((e, j) => (
                  <EvidenceChip key={j} e={e} />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
