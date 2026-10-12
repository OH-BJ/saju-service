# @saju/interpretation

명식(`@saju/engine`의 `Chart`)으로 섹션별 해석(총평·성격·초년/중년/말년·재물·애정·직업·건강·대운·올해)을 만든다.

```ts
import { buildRuleReading } from "@saju/interpretation";          // 브라우저 가능
import { buildLlmReading, FileReadingCache } from "@saju/interpretation/server"; // 서버 전용

const basic = buildRuleReading(chart);                       // 룰 기반, 즉시·무료·결정적
const detail = await buildLlmReading(chart, { cache });      // Claude 생성, 캐시 우선
```

## 구조
- `src/rules/` — 직접 작성한 룰 데이터(일간 10개, 오행 5개, 십신 5갈래)와 근거 사실 추출(`facts.ts`), 룰 해석 조합(`basicReading.ts`)
- `src/llm/` — 시스템 프롬프트(`prompt.ts`), Claude 호출(`generate.ts`)
- `src/cache.ts` — 캐시 키(명식·대운·연도·모델·프롬프트 버전의 해시, 이름·생일 미포함), 메모리/파일 캐시

## LLM 설정
- 모델: 기본 `claude-opus-5-5`, `SAJU_LLM_MODEL`로 변경 (예: 비용을 줄이려면 `claude-sonnet-5-5`)
- 구조화 출력(Zod 스키마)으로 11개 섹션을 빠짐없이 받는다
- `fallbacks: "default"`: 안전 분류기 거절 시 서버가 대체 모델로 재시도
- 시스템 프롬프트에 `cache_control` 지정. 요청마다 바뀌는 값은 사용자 메시지에만 넣는다
- 프롬프트를 고치면 `PROMPT_VERSION`을 올린다 (이전 캐시 무효화)

> 크롤링한 운신 해석 문구는 저작물이므로 여기에 넣지 않는다.
