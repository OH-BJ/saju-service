"use client";

import { computeChart } from "@saju/engine";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Seal3D } from "@/components/ink/Seal3D";
import { personToQuery, toBirthInput, type Person } from "@/lib/birth";
import type { MenuInfo } from "@/lib/menus";
import { useProfile } from "@/lib/profile";

const EMPTY: Person = { name: "", year: 0, month: 0, day: 0, time: "", calendar: "solar", gender: "male" };

const inputCls =
  "w-full border-0 border-b border-ink bg-transparent px-0 py-1.5 font-serif text-[17px] text-ink outline-none placeholder:text-ink-faint focus:border-seal tabular-nums";
const labelCls = "flex flex-col gap-0.5 font-sans text-[11px] tracking-[0.12em] text-ink-soft";

function PersonFields({ id, value, onChange, legend }: { id: string; value: Person; onChange: (p: Person) => void; legend?: string }) {
  const [unknownTime, setUnknownTime] = useState(value.year > 0 && !value.time);
  const set = <K extends keyof Person>(k: K, v: Person[K]) => onChange({ ...value, [k]: v });
  const num = (s: string) => (s === "" ? 0 : Number(s));

  return (
    <fieldset className="flex flex-col gap-4">
      {legend && <legend className="mb-2 font-brush text-xl">{legend}</legend>}
      <label className={labelCls} htmlFor={`${id}-name`}>
        이름 (선택)
        <input id={`${id}-name`} className={inputCls} maxLength={12} value={value.name} onChange={(e) => set("name", e.target.value)} placeholder="결과에만 표시돼요" />
      </label>

      <div className={labelCls}>
        <span id={`${id}-g`}>성별</span>
        <div className="flex gap-2 pt-1" role="radiogroup" aria-labelledby={`${id}-g`}>
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={value.gender === g}
              onClick={() => set("gender", g)}
              className={`flex items-baseline gap-1.5 rounded-sm border px-3 py-1.5 text-[15px] tracking-normal ${
                value.gender === g ? "border-ink bg-ink text-hanji" : "border-ink/30 text-ink-2"
              }`}
            >
              <span className="font-brush text-lg leading-none">{g === "male" ? "乾" : "坤"}</span>
              <span className="font-sans text-xs">{g === "male" ? "남" : "여"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={labelCls}>
        <span>생년월일</span>
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3">
          <input id={`${id}-y`} aria-label="태어난 해" className={inputCls} inputMode="numeric" placeholder="1995" maxLength={4} value={value.year || ""} onChange={(e) => set("year", num(e.target.value.replace(/\D/g, "")))} />
          <input id={`${id}-m`} aria-label="태어난 달" className={inputCls} inputMode="numeric" placeholder="월" maxLength={2} value={value.month || ""} onChange={(e) => set("month", num(e.target.value.replace(/\D/g, "")))} />
          <input id={`${id}-d`} aria-label="태어난 날" className={inputCls} inputMode="numeric" placeholder="일" maxLength={2} value={value.day || ""} onChange={(e) => set("day", num(e.target.value.replace(/\D/g, "")))} />
        </div>
        <div className="flex gap-1.5 pt-2">
          {(
            [
              ["solar", "양력"],
              ["lunar", "음력"],
              ["lunar-leap", "음력 윤달"],
            ] as const
          ).map(([c, l]) => (
            <button
              key={c}
              type="button"
              aria-pressed={value.calendar === c}
              onClick={() => set("calendar", c)}
              className={`rounded-full border px-3 py-1 text-xs tracking-normal ${value.calendar === c ? "border-seal text-seal" : "border-ink/25 text-ink-soft"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className={labelCls}>
        <label htmlFor={`${id}-t`}>태어난 시각</label>
        <div className="flex items-center gap-4">
          <input
            id={`${id}-t`}
            type="time"
            className={`${inputCls} max-w-[10rem] disabled:opacity-40`}
            value={value.time}
            disabled={unknownTime}
            onChange={(e) => set("time", e.target.value)}
          />
          <label className="flex items-center gap-1.5 text-xs tracking-normal text-ink-2">
            <input
              type="checkbox"
              className="accent-seal"
              checked={unknownTime}
              onChange={(e) => {
                setUnknownTime(e.target.checked);
                if (e.target.checked) set("time", "");
              }}
            />
            모름
          </label>
        </div>
        <span className="text-[10.5px] tracking-normal">모르면 시주(時柱) 없이 여섯 글자로 풉니다.</span>
      </div>
    </fieldset>
  );
}

function validate(p: Person): string | null {
  if (!p.year || !p.month || !p.day) return "생년월일을 모두 적어 주세요.";
  if (p.year < 1920 || p.year > 2040) return "1920년부터 2040년 사이로 적어 주세요.";
  try {
    computeChart(toBirthInput(p));
    return null;
  } catch (e) {
    return e instanceof RangeError ? "달력에 없는 날짜예요. 양력·음력과 윤달 여부를 확인해 주세요." : "계산할 수 없는 날짜예요.";
  }
}

/** 생년월일 입력 → 인장을 찍으면 결과 페이지로 */
export function BirthForm({ menu }: { menu: MenuInfo }) {
  const router = useRouter();
  const { me, partner, setMe, setPartner } = useProfile();
  const [a, setA] = useState<Person>(EMPTY);
  const [b, setB] = useState<Person>({ ...EMPTY, gender: "female" });
  const [error, setError] = useState<string | null>(null);
  const [pressing, setPressing] = useState(false);

  // 저장된 프로필은 하이드레이션 뒤 스토어 값이 들어오면 한 번만 채운다
  const filled = useRef({ a: false, b: false });
  useEffect(() => {
    if (me && !filled.current.a) {
      filled.current.a = true;
      setA(me);
    }
    if (partner && !filled.current.b) {
      filled.current.b = true;
      setB(partner);
    }
  }, [me, partner]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(a) ?? (menu.pair ? validate(b) : null);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setMe(a);
    if (menu.pair) setPartner(b);
    const q = new URLSearchParams({ ...personToQuery(a), ...(menu.pair ? personToQuery(b, "b") : {}) });
    setPressing(true);
    setTimeout(() => router.push(`${menu.href}/result?${q}`), 420);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-8" noValidate>
      <PersonFields id="a" value={a} onChange={setA} legend={menu.pair ? "나" : undefined} />
      {menu.pair && <PersonFields id="b" value={b} onChange={setB} legend="상대" />}
      {error && (
        <p role="alert" className="font-sans text-sm text-seal">
          {error}
        </p>
      )}
      <button type="submit" className="group flex items-center justify-end gap-4 self-end font-sans text-sm tracking-[0.25em] text-ink-2">
        인장 찍기
        <span className="grid size-16 place-items-center" style={{ perspective: 400 }}>
          <span className={`seal-btn ${pressing ? "seal-btn-press" : ""}`} style={{ transformStyle: "preserve-3d" }}>
            <Seal3D />
          </span>
        </span>
      </button>
    </form>
  );
}
