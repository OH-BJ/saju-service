import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 계산 엔진은 브라우저에서 돌지만, 서버 렌더링 시에는 CJS 라이브러리를 번들에서 뺀다
  serverExternalPackages: ["lunar-javascript", "korean-lunar-calendar"],
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
