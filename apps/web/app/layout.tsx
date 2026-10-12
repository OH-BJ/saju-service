import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "평생사주",
  description: "생년월일시로 보는 사주명식과 운세",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="site-header">
          <Link href="/">평생사주</Link>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">사주 풀이는 오락·참고용이며 건강·재정 결정의 근거가 될 수 없습니다.</footer>
      </body>
    </html>
  );
}
