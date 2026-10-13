"use client";

import { computeChart, type Chart } from "@saju/engine";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SealDrop } from "@/components/ink/SealDrop";
import { TermProvider } from "@/components/reading/TermSheet";
import { callName, describePerson, personFromQuery, toBirthInput, type Person } from "@/lib/birth";
import { MENUS, type MenuInfo } from "@/lib/menus";

export interface Subject {
  person: Person;
  chart: Chart;
}

/**
 * 결과 화면 공통 틀: 쿼리 → 명식 계산 → (처음 한 번) 인장 전환 장면 → 본문.
 * 계산은 모두 브라우저에서 한다.
 */
export function ResultShell({
  menu,
  caption,
  children,
}: {
  menu: MenuInfo;
  caption: (s: Subject[]) => string;
  children: (subjects: Subject[]) => React.ReactNode;
}) {
  const q = useSearchParams();
  const qs = q.toString();
  const result = useMemo(() => {
    const people = [personFromQuery(q), ...(menu.pair ? [personFromQuery(q, "b")] : [])];
    if (people.some((p) => !p)) return { error: "입력 정보가 없거나 잘못되었습니다." } as const;
    try {
      return { subjects: (people as Person[]).map((person) => ({ person, chart: computeChart(toBirthInput(person)) })) } as const;
    } catch {
      return { error: "달력에 없는 날짜입니다. 양력·음력과 윤달 여부를 확인해 주세요." } as const;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs, menu.pair]);

  // 같은 결과는 세션에서 한 번만 전환 장면을 보여 준다
  const seenKey = `mukyeon-drop:${menu.key}:${qs}`;
  const [phase, setPhase] = useState<"pending" | "drop" | "done">("pending");
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(seenKey) === "1";
    } catch {}
    setPhase(seen ? "done" : "drop");
  }, [seenKey]);
  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(seenKey, "1");
    } catch {}
    setPhase("done");
  }, [seenKey]);

  if ("error" in result) {
    return (
      <div className="flex flex-col gap-4 pt-16">
        <p className="text-lg font-bold">{result.error}</p>
        <Link href={menu.href} className="font-sans text-sm text-seal underline underline-offset-4">
          다시 적으러 가기
        </Link>
      </div>
    );
  }

  const subjects = result.subjects;
  return (
    <TermProvider>
      {phase === "drop" && <SealDrop pillars={subjects[0]!.chart.pillars} caption={caption(subjects)} onDone={finish} />}
      {phase !== "pending" && (
        <div className="flex flex-col gap-8 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-sans text-[11px] tracking-[0.35em] text-ink-soft">{menu.title}</p>
              {subjects.map((s, i) => (
                <p key={i} className="mt-1 font-sans text-xs text-ink-soft">
                  <b className="font-serif text-sm text-ink">{callName(s.person)}</b> · {describePerson(s.person)}
                </p>
              ))}
            </div>
            <Link href={menu.href} className="shrink-0 font-sans text-xs text-ink-soft underline underline-offset-4">
              다시 입력
            </Link>
          </div>
          {subjects.flatMap((s) => s.chart.warnings).map((w) => (
            <p key={w} className="border-l-2 border-seal pl-3 font-sans text-xs leading-5 text-seal">
              {w}
            </p>
          ))}
          {children(subjects)}
          <OtherMenus current={menu.key} query={qs} />
        </div>
      )}
    </TermProvider>
  );
}


/** 같은 입력으로 다른 풀이 보기 */
function OtherMenus({ current, query }: { current: string; query: string }) {
  const q = new URLSearchParams(query);
  const single = new URLSearchParams();
  for (const k of ["p", "n"]) if (q.get(k)) single.set(k, q.get(k)!);
  return (
    <nav aria-label="다른 풀이" className="mt-6">
      <p className="font-sans text-[11px] tracking-[0.35em] text-ink-soft">같은 명식으로 더 보기</p>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {MENUS.filter((m) => m.key !== current).map((m) => (
          <li key={m.key}>
            <Link
              href={m.pair ? m.href : `${m.href}/result?${single}`}
              className="flex items-center gap-3 rounded-sm border border-ink/20 px-3 py-2.5 hover:border-seal"
            >
              <span className="font-brush text-xl leading-none">{m.hanja}</span>
              <span className="text-sm">{m.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
