import type { Metadata } from "next";
import { MenuIntro } from "@/components/menu/MenuIntro";
import { menuOf } from "@/lib/menus";

export const metadata: Metadata = { title: "궁합" };

export default function Page() {
  return <MenuIntro menu={menuOf("gunghap")} lines={["두 사람의 일간과 배우자 자리, 띠,", "서로 채워 주는 오행을 근거와 함께 봅니다."]} />;
}
