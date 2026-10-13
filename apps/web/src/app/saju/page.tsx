import type { Metadata } from "next";
import { MenuIntro } from "@/components/menu/MenuIntro";
import { menuOf } from "@/lib/menus";

export const metadata: Metadata = { title: "평생사주" };

export default function Page() {
  return <MenuIntro menu={menuOf("saju")} lines={["타고난 기질, 강약과 필요한 기운,", "합과 충, 신살, 십 년마다 바뀌는 대운까지."]} />;
}
