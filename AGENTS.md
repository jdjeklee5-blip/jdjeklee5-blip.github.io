# jinaLog AI Coding Agent Guide

이 가이드는 **Codex, Gemini, Claude** 를 포함해 `jinaLog` 를 만지는 모든 AI 코딩 에이전트가 준수해야 하는 **최우선 행동 강령**이다. 상세 규칙은 [`CLAUDE.md`](CLAUDE.md) 와 동일하며, 이 문서는 그 요약이다.

## 1. 가장 먼저 알아야 할 것 — 글은 사용자 콘텐츠다

`src/posts/**/*.md` 의 내용을 **임의로 수정하거나 생성하지 마라.** 오탈자로 보이는 것도 마찬가지다. 요청이 "글을 써달라"가 아니라면 `.md` 는 읽기 전용으로 다룬다. 새 글 추가는 `/new-post` 스킬이 절차를 갖는다.

**현재 `src/posts/` 는 비어 있고 그 상태가 정상이다.** 글은 저장소 밖에서 관리된다. `posts-meta.json` 이 `[]` 인 것을 버그로 보고 고치려 하지 마라.

## 2. 기술 명세

* **런타임**: React 19.2 + TypeScript (Strict) + Vite 8
* **라우팅**: React Router 7 (`BrowserRouter`, `basename` 없음)
* **콘텐츠**: `src/posts/<카테고리>/<slug>.md` — 폴더가 곧 카테고리다
* **렌더링**: react-markdown 10 + remark-gfm/math + rehype-katex/slug + shiki 4 (fine-grained) + mermaid
* **스타일**: vanilla CSS + CSS 변수. **라이트 테마 전용** (Tailwind·CSS-in-JS 없음)
* **배포**: `main` push → GitHub Actions → GitHub Pages 유저 사이트 (루트 서빙)

## 3. 손대면 안 되는 것

1. **`src/posts/**/*.md`** — 사용자 콘텐츠.
2. **`src/lib/posts-meta.json`** — `scripts/build-posts-index.mjs` 의 생성물. 손으로 고치면 다음 빌드에 덮인다.
3. **`vite.config.js` 의 `base: '/'`** — `'./'` 나 `'/jinaLog/'` 로 바꾸면 글 상세 직접 URL 진입이 깨진다.
4. **라이트 테마 전용** — 다크 토큰·토글을 되살리지 마라.
5. **UI 에 이모지·이모티콘 금지** — letter-mark 로 통일돼 있다.
6. **`subcategory-rules.js` 의 규칙 순서** — "더 구체적인 규칙이 앞". 바꾸면 기존 글이 조용히 재분류된다.

## 4. 번들 구조 — 깨뜨리지 마라

메타는 빌드 타임에 `posts-meta.json` 으로 뽑아 정적 import 하고, 본문은 `import.meta.glob` **lazy** 로 글당 청크가 되어 React 19 `use()` 훅이 소비한다. `PostDetail` 도 shiki + KaTeX 때문에 `React.lazy` 로 분리돼 있다.

**금지**: 본문 eager glob, `PostDetail` 정적 import, 메타 JSON 대신 런타임 파싱. 배경은 [`docs/engine/content.md`](docs/engine/content.md).

## 5. 콘텐츠 규격 (요약)

- 필수: `title`, `date`(`YYYY-MM-DD`). 선택: `tags`, `summary`, `cover`, `draft`, `private`, `series`/`seriesOrder`, `order`
- 파서는 `src/lib/parse-frontmatter.js` **자체 구현**이다. **멀티라인 배열·중첩 YAML 을 조용히 무시한다** (의도된 축소)
- slug 는 전역 유일. 카테고리·slug 에 한글은 허용하되 **공백 금지**, 하이픈을 쓴다
- 이미지는 카테고리 폴더의 `images/` 에 두고 `./images/<파일>` 로만 참조한다 — 다른 경로는 해석되지 않는다
- `private: true` 는 **비노출이지 비밀이 아니다** (직접 URL 로는 접근됨)

## 6. 검증 프로세스

```bash
pnpm install        # node_modules 가 없으면 먼저
npx tsc --noEmit
pnpm build
```

**`pnpm install` 을 건너뛰지 마라.** `node_modules` 없이 `npx tsc --noEmit` 을 돌리면 npm 이 무관한 `tsc` 패키지를 받아와 **통과한 것처럼 보인다.** `pnpm build` 를 함께 돌리는 이유는 `vite build` 가 타입을 검사하지 않고, 반대로 빌드 뒷단 스크립트는 `tsc` 가 보지 못하기 때문이다.

현재 `tsc` 는 기존 에러 5건을 낸다. **에러 수가 늘지 않았는지**로 판단한다.

## 7. 문서 동기화

기능을 추가·변경·제거했으면 **같은 작업 안에서** 영향받는 문서를 맞춘다. **현재 상태만 적는다** — 예전엔 어땠고 무엇이 바뀌었다는 서술은 남기지 않는다. 낡은 결정은 지우고 새로 쓴다.

## 8. 규칙 문서

읽고 참조하는 규칙은 전부 `docs/` 에 있고, **두 축**으로 나뉜다.

| 폴더 | 언제 |
| :--- | :--- |
| `docs/writing/` | **글을 쓸 때** — 어디에 어떤 파일명으로, frontmatter·이미지·카테고리·시리즈 |
| `docs/engine/` | **블로그를 고칠 때** — 설계 의도·구현·컨벤션 |

UI 를 만지기 전에는 [`docs/engine/design.md`](docs/engine/design.md) 를 항상 먼저 읽고, 주석 규칙은 [`docs/engine/comments.md`](docs/engine/comments.md) 다.

실행 절차가 있는 것만 스킬로 둔다 (`.agents/skills/`, Claude 는 `.claude/skills/`).
