---
type: Writing Guide
title: frontmatter 작성법
description: 글 최상단 메타데이터 블록의 필드 스펙과 파서 제약. 새 글을 쓰거나 기존 글의 메타를 고칠 때 참조한다.
tags: [writing, frontmatter, metadata]
---

# frontmatter 작성법

각 `.md` 파일 최상단에 `---` 로 감싼 YAML 블록으로 메타데이터를 선언한다.

```markdown
---
title: HTTP 기초
date: 2026-04-05
tags: [http, network]
summary: HTTP의 기본 개념과 메서드, 상태 코드 정리
---

본문 시작...
```

**필수는 `title` 과 `date` 둘뿐이다.**

---

## 1. 필드

| 필드 | 필수 | 값 | 용도 |
| :--- | :--: | :--- | :--- |
| `title` | ✅ | string | 제목. 목록·상세·브라우저 탭에 쓰인다 |
| `date` | ✅ | `YYYY-MM-DD` | 정렬 기준. 최신순으로 나열된다 |
| `tags` | ⬜ | `[a, b, c]` | 태그 필터 + **하위 카테고리 자동 분류의 입력** ([categories.md](categories.md)) |
| `summary` | ⬜ | string | 목록 카드의 미리보기 한 줄 |
| `cover` | ⬜ | `./images/<파일>` | 홈·카테고리 카드의 대표 이미지. 없으면 letter-mark fallback |
| `draft` | ⬜ | boolean | `true` 면 배포본에서 빠진다. 로컬 dev 에선 "초안" 배지와 함께 보인다 |
| `private` | ⬜ | boolean | 목록·인덱스에서 숨긴다. 아래 주의 참조 |
| `series` | ⬜ | string | 시리즈 이름 ([series.md](series.md)) |
| `seriesOrder` | ⬜ | number | 시리즈 내 순서(1부터). `series` 가 있으면 **필수** |
| `order` | ⬜ | number | 같은 날짜 글끼리의 표시 순서. 없으면 이름순 |

### `private` 는 비밀이 아니라 비노출이다

`private: true` 는 목록·카테고리·태그·시리즈 인덱스에서만 숨긴다. **URL(`/posts/<slug>`)을 아는 사람은 그대로 볼 수 있다.** 정적 사이트라 서버 인증이 없기 때문이다.

숨긴 글은 `/9901` 페이지에서 모아 볼 수 있다.

**진짜로 공개되면 안 되는 내용은 이 저장소에 두지 마라.**

### `draft` 와 `private` 의 차이

| | 로컬 dev | 배포본 |
| :--- | :--- | :--- |
| `draft: true` | 보인다 (초안 배지) | **아예 없다** |
| `private: true` | 목록에서 숨음 | 목록에서 숨음, **직접 URL 은 열린다** |

---

## 2. 파서 제약 — 반드시 알아야 할 것

frontmatter 파서는 이 프로젝트의 **자체 구현**(`src/lib/parse-frontmatter.js`)이다. gray-matter 같은 범용 YAML 파서가 아니다.

지원하는 것은 **스칼라 값, 인라인 배열, 빈 값, 주석**뿐이다.

**멀티라인 배열과 중첩 YAML 은 파싱되지 않고 조용히 무시된다.** 에러가 나지 않으므로 눈치채기 어렵다.

```markdown
tags: [spring, jpa]    # 정상

tags:                  # 파싱 안 됨 — 태그가 통째로 사라진다
  - spring
  - jpa
```

배열은 **반드시 한 줄로** 쓴다. 이건 버그가 아니라 규격이다 — 이유는 [`engine/content.md`](../engine/content.md) 참조.

---

## 3. 검증 규칙

- `title` 또는 `date` 가 없으면 빌드가 경고하고 그 글을 건너뛴다
- `date` 가 미래여도 경고만 하고 포함한다
- 날짜 형식은 `YYYY-MM-DD` 다. 다른 형식은 정렬이 어긋난다

---

## 연관 도메인

| 도메인 | 관계 |
| :--- | :--- |
| [`categories.md`](categories.md) | `tags` 가 하위 카테고리를 결정하는 방식 |
| [`series.md`](series.md) | `series` / `seriesOrder` 쓰는 법 |
| [`engine/content.md`](../engine/content.md) | 파서를 자체 구현한 이유, 메타 인덱스 생성 |
