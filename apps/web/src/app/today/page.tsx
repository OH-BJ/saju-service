import type { Metadata } from "next";
import { MenuIntro } from "@/components/menu/MenuIntro";
import { menuOf } from "@/lib/menus";

export const metadata: Metadata = { title: "오늘의 운세" };

export default function Page() {
  return <MenuIntro menu={menuOf("today")} lines={["오늘의 일진이 내 일간에게 어떤 기운인지,", "어제와 내일도 넘겨 볼 수 있어요."]} />;
}
