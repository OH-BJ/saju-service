import type { Metadata } from "next";
import { MenuIntro } from "@/components/menu/MenuIntro";
import { menuOf, targetYear } from "@/lib/menus";

export const metadata: Metadata = { title: "신년운세" };

export default function Page() {
  return <MenuIntro menu={menuOf("newyear")} lines={[`${targetYear()}년의 기운이 내 사주와 만나는 방식,`, "분야별 흐름과 열두 달 병풍."]} />;
}
