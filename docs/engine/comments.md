---
type: Convention Guide
title: 주석 규칙
description: 코드로 알 수 있는 내용을 주석으로 반복하지 않고, 비자명한 설계 의도(왜)만 간결히 남긴다. 주석을 작성하거나 리뷰할 때 참조한다.
tags: [conventions, comments, why-not-what]
---

# 주석 규칙

- **코드를 읽으면 알 수 있는 내용을 주석으로 구구절절 반복하지 않는다.** 타입 재진술, 단순히 UI를 렌더링하는 JSX 태그의 의미 설명 금지.
- **`docs/`에 명시된 규칙을 코드 주석으로 되풀이하지 않는다.** 규칙은 한 자리에만 있어야 한다. 코드에 복사하면 두 곳이 어긋난다.
- 주석은 **"왜 이렇게 설계했는가"가 비자명해서 나중에 다른 개발자나 AI 에이전트가 이해하기 곤란할 때만** 간결하게 남긴다.

## 이 저장소에서 특히 주석이 필요한 자리

번들 구조·빌드 파이프라인처럼 **코드만 봐서는 의도가 복원되지 않는** 지점이다. 실제로 아래는 이미 주석이 달려 있고, 지울 때는 왜 불필요해졌는지 확인하고 지운다.

| 자리 | 왜 주석이 필요한가 |
| :--- | :--- |
| `src/lib/posts.ts`의 `import.meta.glob` 두 개 | 본문은 `eager: false`(글당 청크 분리), 이미지 맵은 `eager: true`(경량 경로 매핑). 옵션 차이가 곧 번들 전략이라 코드만으론 안 보인다 |
| `bodyPromiseCache` | React 19 `use(promise)`는 렌더마다 같은 promise를 받아야 한다. 캐시가 최적화가 아니라 **정합성** 장치라는 점 |
| `parse-frontmatter.js`의 지원 범위 | 멀티라인 배열·복잡한 YAML 미지원이 버그가 아니라 **의도된 축소**라는 점 |
| `subcategory-rules.js`의 규칙 순서 | "더 구체적인 규칙이 앞"이 깨지면 글이 조용히 다른 그룹으로 간다 |

## 예시

```ts
// ❌ 코드가 이미 말하는 것
// posts 배열을 필터링해서 private가 아닌 것만 반환한다
export const publicPosts = posts.filter((p) => !p.private)

// ✅ 코드가 말하지 않는 것
// 목록·카테고리·태그·시리즈 인덱스에서만 숨긴다.
// 직접 URL(/posts/<slug>)로는 여전히 접근 가능 — getPostBySlug는 전체 posts를 본다.
export const publicPosts = posts.filter((p) => !p.private)
```
