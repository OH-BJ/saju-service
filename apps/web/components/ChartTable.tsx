import { BRANCH_ELEMENT, stemElement, type Chart, type PillarKey } from "@saju/engine";

const COLUMNS: { key: PillarKey; label: string }[] = [
  { key: "hour", label: "시주" },
  { key: "day", label: "일주" },
  { key: "month", label: "월주" },
  { key: "year", label: "년주" },
];

/** 사주명식 4주 표 (전통 순서: 시·일·월·년) */
export function ChartTable({ chart }: { chart: Chart }) {
  const { pillars, analysis } = chart;
  return (
    <table className="pillars">
      <thead>
        <tr>
          <th />
          {COLUMNS.map((c) => (
            <th key={c.key}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>천간</th>
          {COLUMNS.map(({ key }) => {
            const p = pillars[key];
            return (
              <td key={key}>
                {p ? (
                  <>
                    <span className={`glyph el-${stemElement(p.stem)}`}>{p.hanja[0]}</span>
                    <span className="sub">{analysis.sipsin[key]?.stem}</span>
                  </>
                ) : (
                  <span className="sub">모름</span>
                )}
              </td>
            );
          })}
        </tr>
        <tr>
          <th>지지</th>
          {COLUMNS.map(({ key }) => {
            const p = pillars[key];
            return (
              <td key={key}>
                {p ? (
                  <>
                    <span className={`glyph el-${BRANCH_ELEMENT[p.branch]}`}>{p.hanja[1]}</span>
                    <span className="sub">{analysis.sipsin[key]?.branch}</span>
                  </>
                ) : (
                  <span className="sub">모름</span>
                )}
              </td>
            );
          })}
        </tr>
        <tr>
          <th>12운성</th>
          {COLUMNS.map(({ key }) => (
            <td key={key}>
              <span className="sub">{analysis.unseong12[key] ?? "-"}</span>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
