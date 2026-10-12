import type { NextConfig } from "next";

/**
 * PAGES=1 이면 GitHub Pages 용 정적 빌드(out/)를 만든다.
 * - API 라우트(route.ts)는 pageExtensions 에서 .ts 를 빼서 제외 → AI 해석 없이 기본 해석만 제공
 * - 저장소 이름 하위 경로(BASE_PATH)에 배포
 */
const isPages = process.env.PAGES === "1";
const basePath = isPages ? (process.env.BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  // lunar-javascript(CJS)는 서버 렌더링 시 번들에서 제외
  serverExternalPackages: ["lunar-javascript", "korean-lunar-calendar"],
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(isPages && {
    output: "export",
    basePath,
    trailingSlash: true,
    pageExtensions: ["tsx"],
    images: { unoptimized: true },
  }),
};

export default nextConfig;
