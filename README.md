# 평생사주 (saju-service)

생년월일시로 **사주명식(四柱命式)을 계산**하고, 오행·십신·대운을 분석해 **섹션별 운세 해석**을 보여주는 웹 서비스입니다.

**🔗 데모: https://oh-bj.github.io/saju-service/**

> 데모(GitHub Pages)는 정적 사이트라 **룰 기반 해석**까지만 제공합니다. Claude AI 상세 해석은 API 키를 넣은 서버 배포에서 켜집니다.

---

## 주요 기능

| 기능 | 내용 |
|---|---|
| 만세력 계산 | 년·월·일·시 4주(8글자). 입춘·절기의 **절입 시각** 기준, 음력·윤달 지원 |
| 시간 보정 | 한국 서머타임(1948~60, 1987~88)·UTC+8:30 시기 자동 반영, 子시 23:30 기준, 야자시/조자시 구분 |
| 분석 | 오행 분포, 십신, 지장간, 12운성, 대운(순행·역행, 대운수), 세운 |
| 기본 해석 | 일간 10개·일주 60개·오행·십신 룰로 11개 섹션 즉시 생성 (무료, 브라우저에서 동작) |
| AI 상세 해석 | 명식과 근거 사실을 Claude에 전달해 개인화된 문장으로 재작성 (서버 전용, 캐시) |

해석 섹션: 총평 · 성격과 기질 · 초년운 · 중년운 · 말년운 · 재물운 · 애정운 · 직업과 적성 · 건강 관리 · 대운 흐름 · 올해의 운세

---

## 구조

pnpm workspace + Turborepo 모노레포입니다.

```
apps/
  web/                    Next.js 16 웹 앱 (입력 폼 → 명식표 · 오행 · 대운 · 해석)
    app/api/reading/      Claude 해석 API (서버 배포 전용)
packages/
  saju-engine/            만세력·사주 계산 엔진 (순수 함수, 브라우저/서버 공용)
  interpretation/         해석 생성
    src/rules/            룰 데이터(일간·일주·오행·십신)와 기본 해석
    src/llm/              Claude 프롬프트와 호출 (서버 전용 진입점 /server)
tools/
  crawler/                엔진 검증용 데이터 수집 (Firecrawl)
docs/
  saju-rules.md           계산 규칙 결정 사항과 검증 결과
```

```
생년월일시 ──▶ saju-engine ──▶ Chart(4주·십신·오행·대운)
                                  │
                                  ├─▶ 룰 기반 해석 (즉시) ─────────────▶ 화면
                                  └─▶ /api/reading ─▶ Claude ─▶ 캐시 ─▶ 화면 (서버 배포 시)
```

---

## 계산 정확도 검증

외부 사주 서비스의 결과 15건(절기 경계, 자시, 윤달, 서머타임 등 경계 케이스 포함)과 명식을 대조했습니다.

- **12건 일치**
- **3건은 엔진이 의도적으로 다름** — 절입 시각, 서머타임 보정, 윤달을 엔진이 더 정확히 처리한 경우로, 근거는 [docs/saju-rules.md](docs/saju-rules.md)에 기록했습니다.

비교 데이터에는 간지(8글자)만 저장하며, 외부 서비스의 해석 문구는 저장소에 포함하지 않고 해석에도 사용하지 않습니다. 모든 해석 문구는 직접 작성했습니다.

---

## 시작하기

요구 사항: Node.js 22+, pnpm 11

```bash
pnpm install
pnpm build                       # 엔진 → 해석 → 웹 순서로 빌드
pnpm --filter @saju/web dev      # http://localhost:3000
```

### AI 상세 해석 켜기

`apps/web/.env.local` 파일을 만들고 다음을 넣습니다.

```bash
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_AI_ENABLED=1
# SAJU_LLM_MODEL=claude-sonnet-5-5   # 기본값 claude-opus-5-5
```

- 생성되는 동안 기본 해석을 먼저 보여주고, 완료되면 AI 해석으로 바뀝니다.
- 같은 명식은 캐시(`apps/web/.cache/`)에서 다시 사용해 API를 호출하지 않습니다. 캐시 키에는 이름·생일이 아닌 간지와 대운만 들어갑니다.
- API 호출이 실패하면 기본 해석으로 대체됩니다.

### 테스트

```bash
pnpm --filter @saju/engine test           # 4주·시간대·음력·대운 + 외부 서비스 대조 (31개)
pnpm --filter @saju/interpretation test   # 룰 해석·일주 60개·LLM 요청 형식·캐시 (9개)
```

---

## 배포

### GitHub Pages (기본 해석만)

`main`에 푸시하면 GitHub Actions가 테스트 후 정적 사이트를 배포합니다 ([.github/workflows/pages.yml](.github/workflows/pages.yml)).
로컬에서 같은 빌드를 만들려면:

```bash
PAGES=1 BASE_PATH=/saju-service pnpm --filter @saju/web build   # → apps/web/out/
```

### 서버 배포 (AI 해석 포함)

Vercel 등 Node.js 서버 환경에 `apps/web`을 배포하고, 위의 환경변수를 설정합니다.

---

## 계산 규칙 요약

| 항목 | 결정 |
|---|---|
| 년주 / 월주 | 입춘 / 12절 절입 **순간** 기준 |
| 음력 변환 | 한국천문연구원 기준 (중국 음력과 다른 날이 있음) |
| 시 보정 | 기본 동경 127.5° 태양시 (子시 = 23:30~01:29 KST), 경도 보정·미보정 옵션 |
| 자시 | 기본 야·조자시 구분 (23시대는 당일 일주, 시간은 다음날 기준) |
| 대운수 | 절입까지 일수 ÷ 3 (1일 = 4개월 단위 반올림) |

자세한 내용은 [docs/saju-rules.md](docs/saju-rules.md)를 참고하세요.

---

## 로드맵

- [x] 만세력 엔진과 경계 케이스 검증
- [x] 룰 기반 해석 (일간 10 · 일주 60 · 오행 · 십신)
- [x] Claude 해석 생성 + 캐시
- [x] GitHub Pages 배포
- [ ] 신살, 합·충·형·파·해 분석
- [ ] 궁합, 신년운세, 오늘의 운세
- [ ] 회원·결제, DB 캐시

---

## 참고 자료

- [6tail/lunar-javascript](https://github.com/6tail/lunar-javascript) — 절기 시각 계산 (MIT)
- [korean-lunar-calendar](https://github.com/usingsky/korean_lunar_calendar_js) — 한국천문연구원 기준 음양력 변환 (MIT)
- [한국천문연구원 음양력 정보 API](https://www.data.go.kr/data/15012679/openapi.do)
- [Claude API 문서](https://docs.claude.com/)

---

> 사주 풀이는 오락·참고용이며 건강·재정·법률 등 중요한 결정의 근거가 될 수 없습니다.
