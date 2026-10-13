# @saju/reading

명식(`@saju/engine`의 `Chart`)으로 메뉴별 룰 해석을 만든다. 브라우저에서 돈다.

```ts
import { buildSajuReading, buildNewyearReading, buildTojungReading, buildGunghapReading, buildTodayReading } from "@saju/reading";

const r = buildSajuReading(chart, 2027); // { headline, subline, chapters[{title, body[], evidence[]}], daeun(병풍), factsForAi }
```

- `src/content/` — 직접 쓴 문구 데이터 (일간 10·일주 60·오행·십신·합충 11·신살·12운성·오늘 10·월운·궁합·토정 144괘·용어 36). 외부 서비스 문구는 쓰지 않는다.
- `src/menus/` — 메뉴별 조립. 문장마다 근거 칩(`evidence`)을 함께 돌려준다.
- `src/prompt.ts` — Gemini에 보낼 시스템 프롬프트와 요청(`toAiRequest`). 이름·생년월일 없이 계산된 근거만 담는다.
