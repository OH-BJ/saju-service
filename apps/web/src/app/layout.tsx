import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "묵연 — 한지 위에 쓰는 사주", template: "%s · 묵연" },
  description: "평생사주, 신년운세, 토정비결, 궁합, 오늘의 운세를 한지 위 먹글씨로 풀어 드립니다.",
};

export const viewport: Viewport = { themeColor: "#f1ece1" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* next/font는 Turbopack CSS 로더와 충돌해 타로처럼 link로 불러온다 */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Song+Myung&family=Nanum+Myeongjo:wght@400;700;800&family=IBM+Plex+Sans+KR:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-full">
        <header className="mx-auto flex max-w-xl items-center justify-between px-5 pt-5">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-brush text-2xl leading-none">墨緣</span>
            <span className="font-sans text-xs tracking-[0.35em] text-ink-soft">묵 연</span>
          </Link>
        </header>
        <main className="mx-auto max-w-xl px-5 pb-16">{children}</main>
        <footer className="mx-auto max-w-xl px-5 pb-10 font-sans text-[11px] leading-relaxed text-ink-soft">
          사주 풀이는 재미와 참고를 위한 것이며 건강·재정·법률 등 중요한 결정의 근거가 될 수 없습니다. 입력한 생년월일은 서버에 저장하지 않습니다.
        </footer>
      </body>
    </html>
  );
}
