---
name: git-commit
description: jinaLog의 커밋 메시지 규격으로 커밋을 만든다. 영문 명령형 한 줄 요약 형식과 글 추가·코드 변경의 구분을 규정한다. 변경 사항을 커밋할 때 사용한다.
---

# 커밋 메시지 규칙

이 저장소는 **영문 명령형 한 줄**을 쓴다. type prefix(`feat:`)도 브랜치명도 붙이지 않는다. 기존 히스토리와 일관성을 지킨다.

- **형식**: `<동사> <무엇을><, 필요하면 왜>`
- **동사**: `Add` · `Fix` · `Update` · `Remove` · `Change` · `Upgrade` · `Migrate`
- **한 줄**로 끝낸다. 본문은 붙이지 않는다.
- 고유명사·글 제목이 한국어면 그대로 섞어 쓴다.

## 실제 히스토리 예시

```
Add WebSocket real-time log streaming series (7 posts)
Fix SPA direct URL access on GitHub Pages by using absolute base path
Remove dark mode — light-only theme for better readability
Upgrade Vite to 8 and add 8 mock interview + 2 coroutine posts
Add SEOHead to subcategory view to fix tab title showing 404
Add Saga + Outbox 패턴 시리즈 4편 및 서브 카테고리 설정
```

## 두 가지를 구분한다

| 대상 | 메시지 |
| :--- | :--- |
| **글 추가·수정** | 몇 편인지, 어떤 묶음인지 밝힌다 — `Add Coroutine series (10 posts) migrated from Tistory` |
| **코드·설정 변경** | 무엇을 왜 바꿨는지 밝힌다. 버그 수정이면 **증상**을 적는다 — `Fix SPA direct URL access ... by using absolute base path` |

증상을 적어두는 게 중요하다. 나중에 "왜 이렇게 돼 있지"를 되짚을 때 커밋 메시지가 유일한 단서다.

## 브랜치

이 저장소는 **`main`에 직접 커밋한다.** 개인 블로그이고 리뷰어가 없으며, `main` push가 곧 배포다.

작업 브랜치를 만들지 마라 — 배포가 안 되고, 머지 후 다시 push해야 해서 단계만 늘어난다. 큰 개편처럼 격리가 필요하면 **먼저 사용자에게 물어본다.**

## 절차

1. `git status --short` / `git diff`로 무엇이 바뀌었는지 확인한다.
2. 무관한 변경이 섞였으면 **나눠서 커밋한다.** 특히 글 추가와 코드 변경은 섞지 않는다.
3. `.omc/`는 `.gitignore` 대상이다. 스테이징에 딸려 들어가지 않는지 본다.
4. 커밋한다.

## 하지 않을 것

- **커밋·push는 사용자가 요청할 때만 한다.** `main` push가 곧 배포다.
- push 전 검증은 `/deploy` 스킬 1장을 따른다.
- `git add -A`로 무턱대고 전부 담지 않는다.
