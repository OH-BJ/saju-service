"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { computeChart, type BirthInput, type CalendarType, type Chart } from "@saju/engine";
import { buildRuleReading, type Reading } from "@saju/interpretation";
import { BASE_PATH } from "@/lib/basePath";
import { ChartTable } from "./ChartTable";
import { OhaengChart } from "./OhaengChart";
import { ReadingSections } from "./ReadingSections";

const CALENDAR_LABEL: Record<CalendarType, string> = { solar: "양력", lunar: "음력", "lunar-leap": "음력(윤달)" };
/** 서버 배포(API 키 있음)에서만 켠다. GitHub Pages 정적 배포에서는 꺼져 있다. */
const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === "1";

/** 쿼리스트링을 엔진 입력으로 변환. 잘못된 값이면 에러 메시지를 반환 */
function parseInput(q: URLSearchParams): BirthInput | string {
  const year = Number(q.get("year"));
  const month = Number(q.get("month"));
  const day = Number(q.get("day"));
  if (!year || !month || !day) return "생년월일을 입력해 주세요.";
  const cal = q.get("calendar") ?? "solar";
  const calendar = (["solar", "lunar", "lunar-leap"].includes(cal) ? cal : "solar") as CalendarType;
  const gender = q.get("gender") === "female" ? "female" : "male";
  const time = /^(\d{1,2}):(\d{2})$/.exec(q.get("time") ?? "");
  return { year, month, day, calendar, gender, ...(time ? { hour: Number(time[1]), minute: Number(time[2]) } : {}) };
}

export function ResultView() {
  const q = useSearchParams();
  const result = useMemo(() => {
    const input = parseInput(q);
    if (typeof input === "string") return { error: input } as const;
    try {
      const chart = computeChart(input);
      return { input, chart, ruleReading: buildRuleReading(chart) } as const;
    } catch (e) {
      return { error: e instanceof Error ? e.message : "계산할 수 없는 날짜입니다." } as const;
    }
  }, [q]);

  if ("error" in result) {
    return (
      <section className="card">
        <h1>입력을 확인해 주세요</h1>
        <p>{result.error}</p>
        <Link href="/">다시 입력하기</Link>
      </section>
    );
  }

  const { input, chart, ruleReading } = result;
  const name = q.get("name")?.trim();
  const timeLabel =
    input.hour !== undefined ? `${String(input.hour).padStart(2, "0")}:${String(input.minute ?? 0).padStart(2, "0")}` : "시간 모름";

  return (
    <>
      <section className="card">
        <h1>{name ? `${name}님의 사주` : "나의 사주"}</h1>
        <p className="muted">
          {input.year}년 {input.month}월 {input.day}일 ({CALENDAR_LABEL[input.calendar]}) {timeLabel} · {input.gender === "male" ? "남" : "여"}
          {input.calendar !== "solar" && ` · 양력 ${chart.solarDate.year}-${chart.solarDate.month}-${chart.solarDate.day}`}
        </p>
        {chart.warnings.map((w) => (
          <p className="warning" key={w}>
            {w}
          </p>
        ))}
      </section>

      <section className="card">
        <h2>사주명식</h2>
        <ChartTable chart={chart} />
        {chart.correctedTime && <p className="muted">시주 계산 기준 태양시: {chart.correctedTime}</p>}
      </section>

      <section className="card">
        <h2>오행 분포</h2>
        <OhaengChart counts={chart.analysis.ohaeng} />
      </section>

      <section className="card">
        <h2>대운 ({chart.daeun.forward ? "순행" : "역행"})</h2>
        <div className="daeun">
          {chart.daeun.list.map((d) => (
            <div key={d.age}>
              <span className="sub">{Math.floor(d.age)}세</span>
              <strong>{d.pillar.hanja}</strong>
              <span className="sub">{d.pillar.hangul}</span>
            </div>
          ))}
        </div>
      </section>

      {AI_ENABLED ? <AiReading input={input} chart={chart} fallback={ruleReading} /> : <ReadingSections sections={ruleReading.sections} />}
    </>
  );
}

type AiState = { status: "loading" } | { status: "done"; reading: Reading } | { status: "error" };

/** 서버 API에서 Claude 해석을 받아 온다. 기다리는 동안과 실패 시에는 룰 기반 해석을 보여 준다. */
function AiReading({ input, chart, fallback }: { input: BirthInput; chart: Chart; fallback: Reading }) {
  const [state, setState] = useState<AiState>({ status: "loading" });
  const key = chart.pillars.day.hanja + chart.instantUtc;

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(`${BASE_PATH}/api/reading`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? (res.json() as Promise<Reading>) : Promise.reject(new Error(String(res.status)))))
      .then((reading) => setState({ status: "done", reading }))
      .catch((e) => {
        if (!controller.signal.aborted) {
          console.error("AI 해석 실패:", e);
          setState({ status: "error" });
        }
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (state.status === "done") {
    return (
      <>
        <p className="muted">AI 상세 해석 · {state.reading.model}</p>
        <ReadingSections sections={state.reading.sections} />
      </>
    );
  }
  return (
    <>
      <p className={state.status === "error" ? "warning" : "muted"}>
        {state.status === "error"
          ? "AI 상세 해석을 불러오지 못해 기본 해석을 보여드립니다."
          : "AI 상세 해석을 작성하고 있습니다. 그동안 기본 해석을 먼저 보여드립니다."}
      </p>
      <ReadingSections sections={fallback.sections} />
    </>
  );
}
