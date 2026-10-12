/** GitHub Pages 처럼 하위 경로에 배포될 때의 접두사 (next.config.ts 에서 주입) */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
