# 묵연 墨緣 — 한지 위에 쓰는 사주

생년월일시로 **사주명식을 계산**하고, 평생사주 · 신년운세 · 토정비결 · 궁합 · 오늘의 운세를 **근거와 함께** 풀어 주는 웹 서비스입니다.
한지 · 먹 · 돌 인장 · 병풍을 입체로 옮긴 연출을 입혔습니다.

**🔗 https://oh-bj.github.io/saju-service/**

## 메뉴

| 메뉴 | 계산 | 화면 |
|---|---|---|
| 평생사주 `/saju` | 4주 · 십신 · 12운성 · 12신살 · 합충형파해·원진·공망 · 신강약 · 간이 용신 · 대운 | 새긴 명판, 오행 생극 오각형, 근거 칩, 대운 병풍 |
| 신년운세 `/newyear` | 세운 × 원국 관계, 분야별 점수, 월운 12개 | 세운 낙관, 먹 획 점수, 12폭 병풍 |
| 토정비결 `/tojung` | 상·중·하 작괘(144괘), 음력 월별 | 괘 번호 인장, 작괘 과정 공개, 음력 병풍 |
| 궁합 `/gunghap` | 일간 생극 · 일지 합충 · 띠 · 오행 보완 → 점수 | 두 인장, 먹 원(圓) 점수, 근거별 가감 |
| 오늘의 운세 `/today` | 오늘 일진 × 일간 십신 · 12운성 · 일지 관계 | 부적 카드, 어제/내일 넘기기, 이번 달 일진 달력 |

- **근거가 보이는 풀이**: 문단마다 근거 칩(예: `월지·일지 戌酉 해`)이 붙고, 누르면 용어 설명이 열립니다.
- **AI 풀이(꺼 둠)**: 계산된 근거만 Gemini에 넘겨 다시 쓰는 기능이 코드에 있지만, 근거에 없는 글자를 지어낼 위험이 있어 공개 사이트에서는 끕니다. 서버 배포에서만 켤 수 있습니다.
- **카드로 저장·공유**: 명식과 오늘의 일진을 한지 카드 이미지(1080×1350)로 저장합니다. 휴대폰에서는 공유 창이 열립니다.
- **입력은 한 번**: 이 기기(localStorage)에만 저장하고, 같은 명식으로 다른 메뉴를 바로 볼 수 있습니다.

## 연출

| 요소 | 구현 |
|---|---|
| 산수 시차 — 먹 농담이 다른 산 네 겹, 기울이면 깊이가 움직임 | CSS 3D + 포인터/기울기 |
| 돌 인장 전환 — 인장이 돌며 떨어져 일간 자리에 찍히고, 종이가 일어서며 일곱 글자가 쓰임 | CSS 3D 육면체 + 키프레임 |
| 새긴 명판 · 병풍 · 붓글씨 등장 | CSS 3D, clip-path |

`prefers-reduced-motion`이면 연출을 건너뜁니다.

## 구조

```
apps/web/                 Next.js 16 (App Router, Tailwind 4)
  src/app/                메뉴별 입력·결과 페이지, api/interpret (Gemini 스트리밍, 서버 배포 전용)
  src/components/ink/     Sansu, SealDrop, Seal3D, Byeongpung, Tilt
  src/components/chart/   PillarSlab, OhaengPentagon
  src/components/reading/ Chapters(근거 칩), TermSheet(용어), AiReading
packages/
  saju-engine/            만세력 + 관계·신살·신강약·용신·세운/월운/일진·토정 작괘·궁합 (순수 함수)
  reading/                직접 쓴 문구 데이터와 메뉴별 해석 조립, AI 프롬프트
tools/crawler/            구조 조사·만세력 대조용 수집기 (Firecrawl)
docs/                     PLAN.md(계획), saju-rules.md(계산 규칙)
```

계산과 풀이는 모두 **브라우저에서** 돌아 GitHub Pages 정적 배포로 충분합니다.

## 시작하기

요구 사항: Node.js 22+, pnpm 11

```bash
pnpm install
pnpm --filter @saju/engine build && pnpm --filter @saju/reading build
pnpm --filter @saju/web dev        # http://localhost:3000
```

AI 풀이를 로컬에서 켜려면 `apps/web/.env.local`:

```bash
GEMINI_API_KEY=...
# GEMINI_MODEL=gemini-2.5-flash
```

> 셸 환경변수에 다른 `GEMINI_API_KEY`가 있으면 Next.js가 그 값을 먼저 씁니다. 그럴 땐 `env -u GEMINI_API_KEY pnpm dev`로 띄우세요.

### 테스트

```bash
pnpm --filter @saju/engine test    # 4주·시간대·음력·대운·외부 대조 + 관계·신살·신강약·토정(조견표·공개 예시)·궁합 (47개)
pnpm --filter @saju/reading test   # 문구 데이터 완결성, 메뉴별 해석, 조사 처리 (10개)
```

## 계산 정확도

외부 사주 서비스 결과 15건(절기 경계, 자시, 윤달, 서머타임)과 명식을 대조해 12건 일치, 3건은 엔진이 더 정확하게 처리한 경우입니다. 규칙과 근거는 [docs/saju-rules.md](docs/saju-rules.md)에 있습니다.

외부 서비스의 해석 문구는 저장소에 넣지 않고 해석에도 쓰지 않습니다. 모든 문구(일주 60, 토정 144괘, 신살·합충·오늘의 운세 등)는 직접 썼습니다.

## 배포

`main`에 푸시하면 GitHub Actions가 테스트 후 정적 사이트를 GitHub Pages에 배포합니다 ([.github/workflows/pages.yml](.github/workflows/pages.yml)). 같은 빌드를 로컬에서 만들려면:

```bash
PAGES=1 BASE_PATH=/saju-service NEXT_PUBLIC_AI_ENABLED=0 pnpm --filter @saju/web build   # → apps/web/out/
```

AI 풀이까지 쓰려면 Node 서버(Vercel 등)에 `apps/web`을 배포하고 `GEMINI_API_KEY`를 넣으면 됩니다.

## 참고

- [6tail/lunar-javascript](https://github.com/6tail/lunar-javascript) — 절기 시각 (MIT)
- [korean-lunar-calendar](https://github.com/usingsky/korean_lunar_calendar_js) — 천문연 기준 음양력 (MIT)
- [Gemini API](https://ai.google.dev/gemini-api/docs)

> 사주 풀이는 재미와 참고를 위한 것이며 건강·재정·법률 등 중요한 결정의 근거가 될 수 없습니다.
