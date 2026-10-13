export type MenuKey = "saju" | "newyear" | "tojung" | "gunghap" | "today";

export interface MenuInfo {
  key: MenuKey;
  href: `/${MenuKey}`;
  /** 세로쓰기 한자 표제 */
  hanja: string;
  title: string;
  desc: string;
  /** 두 사람 입력이 필요한가 */
  pair?: boolean;
}

/** 대상 연도: 10월 이후에는 다음 해 신년운세·토정비결을 보여 준다 */
export const targetYear = (now = new Date()) => (now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear());

export const MENUS: MenuInfo[] = [
  { key: "saju", href: "/saju", hanja: "命式", title: "평생사주", desc: "타고난 그릇과 일생의 흐름" },
  { key: "newyear", href: "/newyear", hanja: "新年", title: `${targetYear()} 신년운세`, desc: "올해의 기운과 열두 달" },
  { key: "tojung", href: "/tojung", hanja: "土亭", title: "토정비결", desc: "세 자리 괘로 읽는 한 해" },
  { key: "gunghap", href: "/gunghap", hanja: "宮合", title: "궁합", desc: "두 사람의 글자가 만날 때", pair: true },
  { key: "today", href: "/today", hanja: "日辰", title: "오늘의 운세", desc: "오늘 일진이 내게 건네는 말" },
];

export const menuOf = (key: MenuKey) => MENUS.find((m) => m.key === key)!;
