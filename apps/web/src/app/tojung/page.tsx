import type { Metadata } from "next";
import { MenuIntro } from "@/components/menu/MenuIntro";
import { menuOf, targetYear } from "@/lib/menus";

export const metadata: Metadata = { title: "토정비결" };

export default function Page() {
  return <MenuIntro menu={menuOf("tojung")} lines={[`나이와 음력 생일로 ${targetYear()}년의 괘를 짓습니다.`, "상·중·하 세 자리 괘와 음력 달마다의 운."]} />;
}
