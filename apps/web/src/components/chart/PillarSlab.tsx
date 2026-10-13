import { BRANCHES, STEMS, type Chart, type PillarKey } from "@saju/engine";
import { Tilt } from "@/components/ink/Tilt";

const COLS: { key: PillarKey; label: string }[] = [
  { key: "hour", label: "時" },
  { key: "day", label: "日" },
  { key: "month", label: "月" },
  { key: "year", label: "年" },
];

/** 여덟 글자를 나무판에 새긴 명판. 일간은 솟은 붉은 인장. */
export function PillarSlab({ chart, detail = true }: { chart: Chart; detail?: boolean }) {
  const { pillars, analysis } = chart;
  return (
    <Tilt max={10}>
      <div className="slab px-2 pt-3 pb-3" role="table" aria-label="사주 명식">
        <div className="grid grid-cols-4 text-center" role="row">
          {COLS.map(({ key, label }) => {
            const p = pillars[key];
            const s = analysis.sipsin[key];
            return (
              <div key={key} className="flex flex-col items-center gap-1" role="cell" style={{ transformStyle: "preserve-3d" }}>
                {detail && <span className="font-sans text-[10px] text-ink-soft">{s?.stem ?? "모름"}</span>}
                <span
                  className={`grid size-12 place-items-center font-brush text-[40px] leading-none ${key === "day" ? "seal-mark" : p ? "carved" : "text-ink-faint"}`}
                  style={{ transform: `translateZ(${key === "day" ? 14 : 6}px)` }}
                >
                  {p ? STEMS[p.stem] : "?"}
                </span>
                <span className={`grid size-12 place-items-center font-brush text-[40px] leading-none ${p ? "carved" : "text-ink-faint"}`} style={{ transform: "translateZ(6px)" }}>
                  {p ? BRANCHES[p.branch] : "?"}
                </span>
                {detail && <span className="font-sans text-[10px] text-ink-soft">{s?.branch ?? ""}</span>}
                <span className="mt-1 w-3/4 border-t border-ink pt-0.5 font-sans text-[10px] tracking-[0.2em] text-ink-soft">{label}</span>
                {detail && (
                  <span className="font-sans text-[10px] leading-tight text-ink-soft">
                    {analysis.unseong12[key] ?? ""}
                    <br />
                    {analysis.sinsal12[key] ?? ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Tilt>
  );
}
