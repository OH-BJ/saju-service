import type { NextConfig } from "next";

/**
 * PAGES=1 이면 GitHub Pages용 정적 사이트(out/)를 만든다.
 * - 계산과 풀이는 모두 브라우저에서 돌아 정적 배포로 충분하다.
 * - AI 풀이 API(route.ts)는 pageExtensions에서 .ts를 빼 제외하고, NEXT_PUBLIC_AI_ENABLED=0으로 버튼도 숨긴다.
 * - 저장소 이름 하위 경로(BASE_PATH)에 배포한다.
 */
const isPages = process.env.PAGES === "1";

const nextConfig: NextConfig = {
  // 서버 렌더링 시에는 CJS 달력 라이브러리를 번들에서 뺀다
  serverExternalPackages: ["lunar-javascript", "korean-lunar-calendar"],
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  ...(isPages && {
    output: "export",
    basePath: process.env.BASE_PATH ?? "",
    trailingSlash: true,
    pageExtensions: ["tsx"],
    images: { unoptimized: true },
  }),
};

export default nextConfig;
