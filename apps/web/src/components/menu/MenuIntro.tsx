import type { MenuInfo } from "@/lib/menus";
import { BirthForm } from "@/components/form/BirthForm";

/** 메뉴 입력 화면: 세로쓰기 표제 + 설명 + 입력 폼 */
export function MenuIntro({ menu, lines }: { menu: MenuInfo; lines: string[] }) {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <div className="flex items-start gap-5">
        <h1 className="brush font-brush text-[46px] leading-none tracking-[0.1em] [writing-mode:vertical-rl]">{menu.hanja}</h1>
        <div className="ink-in pt-10" style={{ animationDelay: ".5s" }}>
          <p className="text-xl font-bold">{menu.title}</p>
          {lines.map((l) => (
            <p key={l} className="mt-1 font-sans text-[14px] leading-6 text-ink-soft">
              {l}
            </p>
          ))}
        </div>
      </div>
      <div className="ink-in" style={{ animationDelay: ".8s" }}>
        <BirthForm menu={menu} />
      </div>
    </div>
  );
}
