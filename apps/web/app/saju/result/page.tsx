import { Suspense } from "react";
import { ResultView } from "@/components/ResultView";

/**
 * 결과 페이지. 명식 계산과 기본 해석은 브라우저에서 수행한다
 * (GitHub Pages 정적 배포에서도 동작하도록).
 */
export default function ResultPage() {
  return (
    <Suspense fallback={<p className="muted">계산 중…</p>}>
      <ResultView />
    </Suspense>
  );
}
