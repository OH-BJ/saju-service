import { ELEMENTS, ELEMENTS_KO } from "@saju/engine";

const COLORS = ["var(--wood)", "var(--fire)", "var(--earth)", "var(--metal)", "var(--water)"];

/** 오행 분포 가로 막대 */
export function OhaengChart({ counts }: { counts: number[] }) {
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="bars">
      {counts.map((n, i) => (
        <div className="bar" key={i}>
          <span>
            {ELEMENTS[i]} {ELEMENTS_KO[i]}
          </span>
          <span className="bar-track">
            <span className="bar-fill" style={{ display: "block", width: `${(n / total) * 100}%`, background: COLORS[i] }} />
          </span>
          <span>{n}</span>
        </div>
      ))}
    </div>
  );
}
