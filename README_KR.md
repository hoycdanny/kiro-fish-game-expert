# 피시게임(魚機) 개발 전문가 — Kiro Power

[English](README.md) | [繁體中文](README_ZH.md) | [简体中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

> 언어 안내: README는 5개 언어로 제공됩니다. Steering 파일(도메인 지식)은 번체 중국어로 작성되며, 법률·기술 용어는 원어를 의도적으로 그대로 유지합니다 — `電子遊戲場業管理條例 §14`, `Gambling Act 2005 §6`, `N.C. Gen. Stat. §14-306.4`, `GLI-11 v3.0` 같은 조항 번호는 원문대로 보존합니다. 원 출처를 찾고 시험기관과 소통하려면 이 정확한 문자열이 필요하기 때문입니다. Steering 파일의 언어와 무관하게 본 Power는 사용자의 언어로 응답합니다.

IDE를 피시게임(捕魚機 / fish shooting game / fish table) 개발 전문 컨설턴트로 바꿉니다. 본 Power는 법적 분류, 포획 판정 RNG, 멀티플레이어 공정성, 배당 제어 완전성, 인증 대응, 책임 있는 게이밍을 개념 단계부터 제출 심사까지 다룹니다.

## ⛔ 한국 사용자를 위한 첫 번째 안내

**한국에서 사행성(투기성) 게임물은 등급분류를 받을 수 없으므로 합법적으로 유통될 수 없습니다.** 게임산업진흥에 관한 법률 체계에서 사행성 판정이 성립하면 그 게임물은 등급분류 대상에서 제외되며, 결과적으로 시장 진입 자체가 **불법**이 됩니다.

피시게임의 고배율 배당 구조와 연속 투입 구조는 사행성 판정의 고위험 특징입니다. 따라서 한국 시장에서는 현금 또는 재물 환전형 피시게임에 합법적 경로가 없다고 보아야 합니다.

본 빌드에서는 관련 조문 원문과 게임물관리위원회의 사행성 판정 실무 사례를 확보하지 못했으므로, 시장 프로파일에서 해당 항목은 신뢰도 `MEDIUM` 및 `UNVERIFIED`로 기록하고 검증 체크리스트를 첨부했습니다. **추정값은 넣지 않았습니다.**

또한 사행성 개념은 영미법계의 predominant factor test나 material element test에 대응하는 개념이 아니므로, **그 틀로 유추해서는 안 됩니다.** 한국 프로젝트의 첫 산출물은 제품 명세가 아니라 조문 원문 확인과 등급분류 실무 조사입니다.

## 본 Power의 성격

이것은 **컴플라이언스 어드바이저**이며 코드 생성기가 아닙니다. 기능을 요청하면 먼저 그 기능이 대상 시장에서 합법인지 알려주고, 그다음에 적법한 구현 방법을 제시합니다.

| | Accelerator | 본 Power(Expert) |
|---|---|---|
| 기능 요청을 받으면 | 바로 구현 | 그 시장에서 합법인지 먼저 확인 |
| 숫자를 물으면 | 사용 가능한 값을 제공 | 값에 **신뢰도, 법적 근거, 검증 방법을 함께** 제공 |
| 성공의 모습 | 작동한다 | 자신이 감수하는 리스크를 안다 |

모든 규제 값에는 신뢰도가 붙습니다: `HIGH`(공식 조문에서 직접 확인), `MEDIUM`(권위 있는 2차 자료), `UNVERIFIED`(**미확인 — 절대 추정하지 않음**). 숫자를 지어내는 어드바이저는 공란을 남기는 어드바이저보다 해롭습니다. 공란은 검증을 유발하지만, 잘못된 숫자는 그대로 제품 명세에 들어갑니다.

피시게임은 슬롯보다 `UNVERIFIED`가 많습니다. 이는 조사 부족이 아니라 도메인의 성질입니다. 대부분의 기술 표준은 단일 플레이어 기기를 대상으로 작성되어 공유 어장(魚池) 멀티플레이어 형태를 다루지 않습니다.

## 왜 슬롯 Power가 아닌가

| 관점 | 슬롯머신 | 피시게임 |
|---|---|---|
| 플레이어 입력 | 단일 트리거(Spin 누름) | 연속 조작: 조준 각도, 발사 타이밍, 포배(砲倍), 표적 선택, 아이템 사용 |
| 결과 단위 | 1회 스핀 | 1발의 탄환; 1회 포획에 수십 발이 필요할 수 있음 |
| 법적 분류 | 명확히 우연의 게임 | 시장에 따라 다름: 도박기구, 기술게임, 오락기구, 불법 장치 |
| 참여자 | 단독 플레이어 | 4~10석이 하나의 어장을 공유하며 상호 영향 |
| 상태 공간 | 릴 정지 조합, 완전 열거 가능 | 물고기 위치·속도·잔여 HP·아이템 상태, 시뮬레이션 필요 |
| 흔한 레드라인 | 클라이언트 측 결과 결정, 비암호학적 RNG | 보상형 배당 제어, 클라이언트 측 포획 판정, 감사 불가한 피해 귀속 |
| RTP 일관성 | 베팅 금액 간 동일 | **포배** 간 동일하며, 모든 기술 수준에서 성립 |
| 환전 형태 | 현금 | 현금／티켓／경품／가상화폐 — 분류상 결과가 크게 다름 |

## 주요 기능

- 🧭 **기술성과 우연성 분류** — 미국의 3가지 법적 테스트(predominant factor, material element, any-chance), 영국의 더 넓은 "결과가 우연에 영향받을 수 있다" 규칙, 대만의 행정 평가 경로, 기술 기여도 정량 증거, 분류 입증 도시에
- 🌍 **관할권 컴플라이언스 매트릭스** — 23개 시장의 법적 지위와 기술적 제약을 시장별로 정리, 각 항목에 법적 근거와 신뢰도 부여
- ⛔ **금지 시장 레지스터** — 피시게임이 불법이거나 집행 대상으로 명시된 시장(플로리다, 노스캐롤라이나, 하와이, 중국 본토, 한국, 일본)을 명확히 표시. 인증으로 진입이 가능해지는 것처럼 암시하지 않습니다
- 🎯 **수학 모델** — 어종 배당표, HP와 포획 확률 모델, 포배 매트릭스와 포배별 RTP 일관성, 특수 무기와 BOSS의 RTP 기여, 변동성 조정
- 🔬 **수학 검증** — 4개 에이전트 기술 수준 민감도 분석을 포함한 3계층 검증, 실측 σ에서 도출한 몬테카를로 표본 수, BOSS와 공동 잭팟의 층화 추출, 16절 피시게임 PAR sheet 규격, 손실 항목 공개
- 🔐 **RNG과 포획 판정** — 엔진별 CSPRNG, 탄환 단위 6단계 라이프사이클, 가장 흔히 누락되는 난수 소비 지점인 어군 생성, 결정론적 리플레이 시드, 물고기 이탈 이벤트를 포함한 완전한 감사 로그 항목
- 🚫 **배당 제어 완전성** — 적법한 장기 RTP 설계와 위법한 보상형 제어의 경계, 3가지 행동 검출 테스트, 제어 제거 후 사업 모델에 일어나는 일
- 👥 **멀티플레이어 공정성** — 공유 어장 모델 A/B/C, 피해 귀속, 최종 타격 규칙, 상한이 있는 롤백 기반 지연 보상, 좌석 간 공정성 검증, 공모 검출
- 🖧 **플랫폼과 시스템** — 테이블 단위 권위 tick loop, 지갑 멱등성, 정적 스핀 로그를 대체하는 대국 리플레이, 크로스테이블 풀 컨트롤러, 감사 로그 용량 경제학
- 🏭 **캐비닛 하드웨어** — 코인·지폐 인식기, 메달 규격, 티켓 배출, 크레딧 투입·인출 권한 관리, 운영자 메뉴 공개, 조작 검출, 필수 표시
- 📋 **인증 준비** — 실제로 어떤 GLI 표준이 적용되는가, 11종 제출 문서 세트, 시험기관 선정, 서면 기술 질의 프로세스
- 🛡️ **책임 있는 게이밍** — 피시게임 고유의 연속 지출 리스크, 자동 발사 제어, 포배 상승, 세션 제한, 발사 요청 수리 전 자기 배제
- 🔁 **변경 관리** — 비트 단위 일치 리플레이 비교를 측정 도구로 사용하는 5단계 변경 분류, 대만의 "신형 기종으로 간주" 규칙
- 🚨 **사고 대응** — 지혈→보전→범위 확정→수정 순서, 양방향 멀티시트 구제 문제
- 🔍 **AML／KYC와 데이터 보호** — 피시게임 고유의 자금세탁 경로인 동일 테이블 가치 이전, 한 테이블의 리플레이가 최대 8명의 데이터 주체를 포함하는 사실
- 🎮 **멀티 엔진** — Unity, Cocos Creator, Unreal Engine, Godot, HTML5/PixiJS, 엔진별 CSPRNG 지침

## 아키텍처

```
개발자(자연어)
    → AI 계층(의도 이해와 계획)
        → 피시게임 개발 전문가 Power(도메인 지식)
            → 먼저 분류, 다음에 리스크를 반영한 적법한 구현

피시게임 개발 전문가(지능 계층)
├── POWER.md              → 워크플로와 참고문헌을 정의하는 주 문서
├── steering/             → 16개 도메인 지식 파일
├── templates/
│   ├── market-profiles/  → 23개 시장 프로파일 + 스키마 + 금지 시장 레지스터
│   ├── certification/    → PAR sheet, RNG 제출 패키지, 분류 입증 도시에, 변경 신청, GLI 체크리스트
│   ├── advisory/         → 갭 평가, 리스크 레지스터, 로드맵, 사고 보고서
│   ├── species-payout/   → 어종 배당표 실례(8석, 96% RTP)
│   └── capture-model/    → 확률적 HP 포획 모델 실례
├── hooks/                → IDE 자동화 훅
└── tests/                → 속성 기반 테스트(fast-check + vitest)
```

## 시장 커버리지

**규제 하에 있거나 명확한 경로가 있는 시장:** 대만(경제부 電子遊戲場業), 영국(UKGC), 말타(MGA), 필리핀(PAGCOR), 퀴라소(LOK), 브라질(SPA), 온타리오(AGCO), 덴마크(Spillemyndigheden), 스웨덴(Spelinspektionen), 네바다, 매사추세츠, 뉴저지, 미시간, 미국 부족 Class III

**금지·그레이·전환 중으로 표시:** 플로리다, 노스캐롤라이나, 하와이, 텍사스, 중국 본토, 한국, 일본, 독일, 펜실베이니아

프로파일의 깊이는 시장마다 다릅니다. 공식 자료에 도달할 수 없었던 시장은 그럴듯한 숫자를 채우는 대신 **`UNVERIFIED`를 명시한 조사 스켈레톤과 검증 체크리스트**로 제공합니다. 대만이 가장 깊은 이유는 기술·환전 제한이 비공개 라이선스 조건이 아니라 성문법에 있기 때문이며, 또한 이 제품 카테고리의 제조·수출 거점이기 때문입니다.

## 사전 요구사항

- [Kiro IDE](https://kiro.dev/docs/getting-started/installation) 설치
- Node.js 18+ (본 Power의 개발·테스트 용도만)

## 설치

### 1단계 — Kiro에 본 Power 추가

Kiro 열기 → 좌측 패널 Powers 아이콘 → "+" → "Add Custom Power" → 본 프로젝트 루트 디렉터리 선택

### 2단계 — 자동 가이던스 Hook 설치(권장)

이 hook은 각 질문을 적절한 Steering File로 라우팅하고 어드바이저 자세를 강제합니다: 먼저 관할권**과 환전 모델**을 확인하고, 미확인 규제 값을 사실로 진술하지 않으며, 레드플래그를 능동적으로 제시합니다.

```bash
mkdir -p .kiro/hooks

# 현행 agent-hook 형식(v1 스키마: version + hooks[] + UserPromptSubmit)
cp hooks/fish-expert-guidance.json .kiro/hooks/

# 구형식(.kiro.hook을 읽는 구버전 Kiro용)
cp hooks/pre-fish-tool.kiro.hook .kiro/hooks/
```

둘 중 하나만 설치하십시오.

### 설치 확인

Kiro에 피시게임 관련 질문을 입력하십시오(예: "96% RTP, 중간 변동성 8석 피시게임 수학 모델을 설계해줘"). AI가 즉시 배당표를 내놓는 대신 **먼저 대상 시장과 환전 모델을 묻는다면** 정상 동작입니다.

## 사용 방법

| 영역 | 질문 예시 |
|---|---|
| 분류 | "우리 피시게임은 기술게임인가요?" "텍사스에 판매할 수 있나요?" "기술 기여도를 어떻게 입증하나요?" |
| 수학 모델 | "96% RTP 어종 배당표를 설계해줘" "왜 최고 포배의 RTP가 낮은가요?" "레이저포의 RTP 기여를 계산해줘" |
| RNG | "Unity 포획 판정에서 CSPRNG를 어떻게 구현하나요?" "감사 로그에 필요한 항목은?" "6단계 탄환 라이프사이클이란?" |
| 배당 제어 | "우리 확률 제어 프로그램이 심사를 통과할까요?" "레거시 코드에서 보상형 제어를 어떻게 찾나요?" |
| 멀티플레이어 | "8석 피해 귀속을 어떻게 설계해야 하나요?" "지연 보상을 공정하게 하려면?" "좌석 간 칩 덤핑을 어떻게 검출하나요?" |
| 인증 | "온라인 피시게임에는 어떤 GLI 표준이 적용되나요?" "제출 서류는 무엇이 필요한가요?" "대만 評鑑分類에는 무엇이 필요한가요?" |

## 지원 게임 엔진

| 엔진 | 언어 | CSPRNG |
|---|---|---|
| Unity | C# | `System.Security.Cryptography.RandomNumberGenerator` |
| Cocos Creator | TypeScript | Web Crypto API / Node.js `crypto` |
| Unreal Engine | C++/Blueprint | OpenSSL `RAND_bytes` |
| Godot | GDScript/C# | `Crypto` 클래스 |
| HTML5/PixiJS | JS/TS | Web Crypto API(`crypto.getRandomValues`) |

모든 경우 포획 판정은 서버 측에서 수행합니다. 클라이언트 측 RNG는 시각적 흔들림 등 결과에 관여하지 않는 용도에만 허용됩니다.

## 개발

```bash
npm install
npm test              # 모든 테스트 실행
npx tsc --noEmit      # TypeScript 타입 검사
```

## 공식 참고 자료

| 출처 | URL |
|---|---|
| 電子遊戲場業管理條例(대만) | https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0080024 |
| UKGC Skill with prizes (SWPs) | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/skill-with-prizes-swps |
| UKGC Gaming machine categories | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/gaming-machine-categories |
| Gambling Act 2005 §6 | https://www.legislation.gov.uk/ukpga/2005/19/section/6 |
| Gift Surplus v. State ex rel. Cooper(NC 2022) | https://www.nccourts.gov/documents/appellate-court-opinions/gift-surplus-llc-v-state-ex-rel-cooper |
| Hawaii SB3281 SD1(2026) | https://data.capitol.hawaii.gov/sessions/session2026/Bills/SB3281_SD1_.HTM |
| Florida Gaming Control Commission | https://flgaming.gov |
| GLI Standards(GLI-11／GLI-19) | https://gaminglabs.com/gli-standards/ |
| GLI-11 Gaming Devices v3.0 | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-Gaming-Devices-V3-0.pdf |
| Arizona Tribal Compact Appendix A | https://gaming.az.gov/sites/default/files/Appendix%20A%20-%20Generic_1.pdf |
| NIGC 25 CFR Part 547 | https://www.ecfr.gov/current/title-25/chapter-III/subchapter-D/part-547 |
| Nevada Regulation 14 | https://gaming.nv.gov |
| Massachusetts 205 CMR 143 | https://www.mass.gov/doc/205-cmr-143-gaming-devices-and-electronic-gaming-equipment/download |
| AGCO Registrar's Standards | https://www.agco.ca/en/lottery-and-gaming/guides/registrars-standards-internet-gaming |
| 덴마크 인증 프로그램 SCP.00–SCP.07 | https://spillemyndigheden.dk/en-us/businesses-and-associations/games-which-require-a-licence/online-casino/certification-programme-for-online-casino |
| NIST SP 800-90A Rev.1 | https://csrc.nist.gov/pubs/sp/800/90/a/r1/final |
| NIST SP 800-90C | https://csrc.nist.gov/pubs/sp/800/90/c/final |
| NIST의 SP 800-22 개정 결정 | https://csrc.nist.gov/News/2022/decision-to-revise-nist-sp-800-22-rev-1a |
| W3C Web Crypto API | https://www.w3.org/TR/WebCryptoAPI/ |
| BMM Testlabs | https://bmm.com/ |
| iTech Labs | https://itechlabs.com/ |
| eCOGRA | https://ecogra.org/ecogra-certification/ |
| GamStop(영국) | https://www.gamstop.co.uk/ |
| Spelpaus(스웨덴) | https://www.spelpaus.se/ |

전체 목록은 POWER.md를 참조하십시오.

### 알아둘 만한 3가지 정정

1. **"기술 요소가 있으니 도박이 아니다"는 통하지 않습니다.** *Gift Surplus, LLC v. State ex rel. Cooper*(NC 2022)에서는 기술 조작을 중심으로 설계된 기기가 우연이 우월하다는 이유로 우연의 게임으로 판단되었습니다. 그것도 미국의 3가지 테스트 중 **공급자에게 가장 유리한** 테스트 하에서의 결론입니다. 영국에서는 더 빨리 무너집니다: 결과가 우연에 영향받을 *수 있다*는 것만으로 game of chance이며, 기술이 우연을 능가하는지, 우연을 제거할 수 있는지는 판단에 영향을 주지 않습니다.

2. **대만의 수출 면제는 도착지에 대해 아무것도 말하지 않습니다.** 電子遊戲場業管理條例 §6은 **전용 수출** 목적의 제조를 대만의 평가분류 의무에서 면제하지만, 그 기기가 도착지에서 합법인지는 전혀 언급하지 않습니다. 수출 프로젝트가 실패하는 가장 큰 원인이며, 본 Power가 가장 자주 정정해야 하는 오독입니다.

3. **NIST 자신의 입장은 SP 800-22를 암호학적 RNG 평가에 사용해서는 안 된다는 것**이지만, 여전히 게이밍 RNG 컴플라이언스 근거로 널리 인용됩니다. 본 Power는 이 불일치를 그대로 따르지 않고 명시합니다.

또한 본 Power는 **GLI와 iTech Labs가 2023년 5월 이후 동일 기업집단**임을 공개합니다. 시장이나 계약이 시험기관의 독립성을 요구할 때 중요합니다.

## 문제 해결

| 증상 | 조치 |
|---|---|
| AI가 전문가로 응답하지 않음 | hook이 `.kiro/hooks/`에 복사되었는지 확인. `pre-fish-tool.kiro.hook`이 발동하지 않으면 사용 중인 Kiro가 v1 스키마를 기대할 수 있으므로 `fish-expert-guidance.json` 사용 |
| AI가 답하지 않고 시장을 되묻는다 | 의도된 동작입니다. 피시게임의 답은 시장 의존적이므로 시장과 환전 모델을 알려주면 진행합니다 |
| 테스트 실패 | `npm install` 실행 후 `npm test` 재시도 |
| TypeScript 타입 오류 | `npm install` 후 `npx tsc --noEmit` 실행 |

## 보안

보안 문제 보고 방법은 [CONTRIBUTING.md](CONTRIBUTING.md#security-issue-notifications)를 참조하십시오.

## 라이선스

MIT License. [LICENSE](LICENSE)를 참조하십시오.
