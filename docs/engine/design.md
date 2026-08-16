---
type: Convention Guide
title: 디자인 규칙
description: UI를 만지기 전에 지켜야 할 제약, 브랜드 성격과 톤, 타이포·색 전략, 안티 레퍼런스. 레이아웃·타이포·색·모션 작업에 들어가기 전에 항상 먼저 읽는다.
tags: [conventions, design, ui, typography]
---

# 디자인 규칙

블로그는 **읽는 경험이 전부**다. 화려한 인터랙션보다 타이포그래피·가독성·로딩 속도가 우선이고, 개성은 그 위에 얹는다.

구체적인 수치·반응형 브레이크포인트·구현 근거는 [`specs/layout.md`](layout.md)가 정본이다. 이 문서는 **그 앞에서 판단 기준이 되는 것**을 다룬다.

---

## 1. 제약 (일반적인 디자인 조언보다 우선한다)

| 제약 | 이유 |
| :--- | :--- |
| **이모지·이모티콘을 UI에 넣지 않는다** | 사이드바·카드·헤딩 전부 letter-mark로 통일돼 있다 |
| **라이트 테마 전용** | 다크 토큰·토글·`prefers-color-scheme` 분기를 만들지 않는다 |
| **본문 가독성이 시각적 임팩트보다 우선한다** | 긴 기술 글을 TOC·코드블록·수식·다이어그램을 오가며 읽는 사이트다 |
| **번들을 늘리는 변경은 근거가 필요하다** | 초기 번들을 메타/본문 분리로 줄여둔 구조다. [`specs/content.md`](content.md) |
| **애니메이션 라이브러리를 새로 넣지 않는다** | View Transition API + CSS로 처리한다 |
| **CSS 프레임워크를 넣지 않는다** | vanilla CSS + CSS 변수 토큰으로 일관성을 유지한다 |
| **시각 값을 하드코딩하지 않는다** | 색·간격·크기는 `src/App.css`의 CSS 변수를 쓴다 |

---

## 2. 사용자

한국어 개발자 본인과 비슷한 관심사를 가진 기술 독자.

주로 **긴 기술 글**(네트워크·쿠버네티스·Spring·Elasticsearch·Redis Streams 등)을 TOC·코드블록·다이어그램·LaTeX 수식을 오가며 읽는다. 데스크톱 비중이 높고 한 세션이 길다.

동기는 이중 구조다.

1. **Author** (본인) — 학습·트러블슈팅 기록 아카이브, 그리고 React 19 실험장
2. **Reader** (비슷한 개발자) — 문제 해결 중 우연히 닿아서 깊게 읽음

이 사이트는 "읽기 도구"이면서 동시에 "작가의 작업장"이다. 둘 다 만족해야 한다.

---

## 3. 브랜드 성격 — Sharp · Honest · Playful

- **Sharp** — **타이포그래피의 날카로움.** 정확한 위계, 군더더기 없는 레이아웃, 선명한 텍스트 대비
- **Honest** — 엔지니어 직설체. "이 부분이 함정이야" 같은 톤. 과장·불필요한 형용사 없음
- **Playful** — 지면 위 장식의 장난이 아니라 **언어와 디테일의 장난.** 문장·링크·마이크로 인터랙션 수준에서만 드러남

**감정 목표**: *"이 사람 진짜 잘 알고 있네"* + *"텍스트만 있는데 왠지 기분 좋다"*. 권위 있는데 딱딱하지 않음.

```
❌ 본 문서에서는 Kubernetes의 Blue-Green 배포 전략에 대해 심층적으로 다루고자 합니다.
✅ Blue-Green 배포는 생각보다 간단한데, k8s에서 하려면 한 가지 함정이 있다. 이걸 먼저 보자.
```

---

## 4. 타이포 — 이중 스택

제목은 **serif**, 본문은 **sans**. 이 대비가 editorial 사이트의 핵심 문법이다. 단일 폰트로 위계를 만들려 하면 약해진다.

| 역할 | 토큰 | 스택 |
| :--- | :--- | :--- |
| Display (제목·큰 타이포) | `--font-display` | Fraunces → Noto Serif KR (한글) |
| Body·UI | `--font-sans` | Inter → Pretendard Variable (한글) |
| Code | `--font-mono` | JetBrains Mono → D2Coding |

- 본문 17px · line-height 1.8 · `word-break: keep-all` — **한국어 가독성은 절대 양보 없음**
- Fraunces는 variable(opsz/wght). `font-optical-sizing: auto`로 크기별 최적 렌더링
- 제목이 지면을 지배해야 editorial이다. 글 상세 h1은 3rem

---

## 5. 색 전략

라이트 단일 테마다. 값은 `src/App.css`의 `:root`가 정본이고, 여기서는 **쓰는 방식**만 정한다.

- 배경 3층: `--bg`(페이지) / `--bg-subtle`(카드) / `--bg-hover`(호버). 차이는 미세하지만 카드를 배경에서 떠오르게 한다
- 텍스트 4단계 위계: `--text` → `--text-secondary` → `--text-muted` → `--text-faint`
- 경계는 조용하게: `--border`, 호버 시 `--border-hover`로 한 단계만
- **Electric Blue `--accent: #2b5bff`는 딱 네 곳에만** — 링크, 포커스 아웃라인, 인라인 코드, hover 시 제목 색. 그 외엔 쓰지 않는다. 그림자·테두리·대형 배경에 블루가 들어가는 순간 **벽지**가 된다
- **그림자를 쓰지 않는다**

---

## 6. 원칙

### Editorial은 "캐릭터 + 여백"이지 "장식 + 여백"이 아니다

제목을 거대한 serif로 쓰는 건 장식이 아니라 **editorial 문법**이다. 섹션 앞의 `01`, `02` CSS 카운터 번호도, 얇은 카드 보더도 같다. "이건 editorial 사이트야"라는 언어이고, 제거하면 editorial이 아니라 단순 미니멀이 된다. **미니멀과 캐릭터 없음은 다르다.**

### 카드는 조용한 박스

`1px solid var(--border)` + `--bg-subtle` 배경 + `radius 10px` + 섀도우 없음. Hover 시 배경·보더 한 단계씩만 lift.

**Cards-on-cards는 금기** — 카드 안에 또 박스를 넣지 않는다.

### 움직임은 색과 미세한 배경 lift만

Hover 피드백은 색 변화 + 카드 배경 lift(`--bg-subtle` → `--bg-hover`). translate·scale·shadow 변화는 쓰지 않는다. `prefers-reduced-motion`을 준수한다.

---

## 7. 안티 레퍼런스 (명시적 금기)

- 회색 + 파란색 accent + 둥근 카드 + 가벼운 soft shadow (**제네릭 AI 룩**)
- 무의미한 그라데이션, Glassmorphism, 블러
- 장식용 일러스트·이모지 과사용
- Material Design·Bootstrap 기본 룩
- **2px 하드 테두리 + 오프셋 컬러 섀도우**(`6px 6px 0 #2b5bff`) — 브루탈리즘 방향. 레퍼런스와 정반대라 기각됐다
- **완전히 투명한 chrome** — 카드 보더 전부 제거, 배경 틴트 없음, radius 0, 단일 폰트. 장식을 걷어내다 **캐릭터까지 걷어낸** 방향이라 기각됐다

뒤의 두 항목은 실제로 시도했다가 되돌린 것들이다. "브루탈하게" / "더 덜어내자" 요청이 다시 나오면 여기를 먼저 본다.

---

## 8. 연관 도메인

| 도메인 | 관계 |
| :--- | :--- |
| [`specs/layout.md`](layout.md) | 타이포 수치·반응형·레이아웃 구현. 구체적인 값은 이쪽이 정본 |
| [`specs/rendering.md`](rendering.md) | 마크다운 본문 렌더링 — 타이포 작업의 실제 대상 |
| `src/App.css` | CSS 변수 토큰의 실제 값 |
