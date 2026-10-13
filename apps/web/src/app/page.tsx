import Link from "next/link";
import { Sansu } from "@/components/ink/Sansu";
import { MENUS } from "@/lib/menus";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <Sansu>
        <div className="absolute top-5 right-9 flex flex-row-reverse items-start gap-2">
          <h1 className="brush font-brush text-[46px] leading-none tracking-[0.1em] [writing-mode:vertical-rl]">墨緣</h1>
          <span className="ink-in mt-1 font-sans text-[11px] tracking-[0.4em] text-ink-soft [writing-mode:vertical-rl]" style={{ animationDelay: ".6s" }}>
            먹 으 로 잇 는 인 연
          </span>
        </div>
      </Sansu>

      <p className="ink-in text-lg leading-8 font-bold" style={{ animationDelay: ".3s" }}>
        먹으로 그린 산 너머,
        <br />
        당신의 여덟 글자를 읽습니다.
        <span className="mt-1 block font-sans text-[13px] font-normal text-ink-soft">태어난 날과 시를 한 번 적으면 다섯 가지 풀이를 모두 볼 수 있어요.</span>
      </p>

      <nav aria-label="풀이 메뉴">
        <ul className="flex flex-col">
          {MENUS.map((m, i) => (
            <li key={m.key} className="ink-in" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>
              <Link href={m.href} className="group grid grid-cols-[3.2rem_1fr_auto] items-center gap-4 border-t border-ink/20 py-4 last:border-b">
                <span className="font-brush text-[26px] leading-none tracking-[0.05em] text-ink transition-colors group-hover:text-seal [writing-mode:vertical-rl]">
                  {m.hanja}
                </span>
                <span>
                  <span className="block text-[17px] font-bold">{m.title}</span>
                  <span className="block font-sans text-[13px] text-ink-soft">{m.desc}</span>
                </span>
                <span className="font-brush text-xl text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-seal" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
