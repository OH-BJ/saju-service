import { ELEMENTS, ELEMENTS_KO, type Element } from "@saju/engine";

const COLORS = ["var(--color-el-wood)", "var(--color-el-fire)", "var(--color-el-earth)", "var(--color-el-metal)", "var(--color-el-water)"];

/**
 * 오행 생극 오각형. 꼭짓점 먹점의 크기 = 개수.
 * 바깥 둘레(실선)는 상생 木→火→土→金→水, 안쪽 별(점선)은 상극 木→土→水→火→金.
 */
export function OhaengPentagon({ counts, dayElement, yongsin }: { counts: number[]; dayElement: Element; yongsin?: Element }) {
  const cx = 130;
  const cy = 118;
  const R = 82;
  const pt = (i: number, r = R) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  };
  const total = counts.reduce((a, b) => a + b, 0) || 1;

  return (
    <figure className="flex flex-col items-center">
      <svg viewBox="0 0 260 240" className="w-full max-w-[300px]" role="img" aria-label={`오행 분포: ${counts.map((n, i) => `${ELEMENTS_KO[i]} ${n}`).join(", ")}`}>
        <defs>
          <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#5c554c" />
          </marker>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const [x1, y1] = pt(i, R - 22);
          const [x2, y2] = pt((i + 1) % 5, R - 22);
          return <line key={`s${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5c554c" strokeWidth="1.2" markerEnd="url(#arrow)" />;
        })}
        {[0, 1, 2, 3, 4].map((i) => {
          const [x1, y1] = pt(i, R - 26);
          const [x2, y2] = pt((i + 2) % 5, R - 26);
          return <line key={`k${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b3261e" strokeOpacity=".45" strokeWidth="1" strokeDasharray="3 4" />;
        })}
        {counts.map((n, i) => {
          const [x, y] = pt(i);
          const r = 8 + n * 5.5;
          return (
            <g key={i}>
              {n > 0 ? (
                <circle cx={x} cy={y} r={r} fill={COLORS[i]} fillOpacity={0.18 + Math.min(n, 4) * 0.16} />
              ) : (
                <circle cx={x} cy={y} r={9} fill="none" stroke="#958b7d" strokeDasharray="2 3" />
              )}
              {i === dayElement && <circle cx={x} cy={y} r={r + 5} fill="none" stroke="#b3261e" strokeWidth="1.2" />}
              <text x={x} y={y + 6} textAnchor="middle" fontFamily="Song Myung, serif" fontSize="19" fill="#1c1a17">
                {ELEMENTS[i]}
              </text>
              <text x={x} y={y + r + 14} textAnchor="middle" fontSize="10.5" fill="#5c554c" fontFamily="IBM Plex Sans KR, sans-serif">
                {n}개 · {Math.round((n / total) * 100)}%{yongsin === i ? " · 용신" : ""}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="font-sans text-[11px] text-ink-soft">
        실선 화살표는 살려 주는 흐름(상생), 붉은 점선은 누르는 흐름(상극). 붉은 고리가 나(일간)의 오행입니다.
      </figcaption>
    </figure>
  );
}
