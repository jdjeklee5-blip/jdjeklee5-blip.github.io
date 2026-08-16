# jinaLog 프로젝트 가이드

## 1. 이 저장소의 역할

`jinaLog` 는 **마크다운 파일을 읽어 보여주는 정적 블로그**다. React 19.2 + Vite 8 + TypeScript(strict), pnpm.

담당하는 것은 셋뿐이다.

1. **글 렌더링** — `src/posts/` 의 `.md` 를 읽어 본문·코드블록·수식·다이어그램으로 그린다.
2. **탐색** — 카테고리·하위 그룹·태그·시리즈 인덱스를 만들어 글을 찾게 한다.
3. **배포** — `main` push 로 GitHub Pages 유저 사이트에 올린다.

### 글은 사용자 콘텐츠다

`src/posts/**/*.md` 의 내용을 **임의로 수정하거나 생성하지 마라.** 오탈자로 보이는 것도 마찬가지다. 요청이 "글을 써달라"가 아니라면 `.md` 는 읽기 전용으로 다룬다.

**현재 `src/posts/` 는 비어 있고 그 상태가 정상이다.** 글은 저장소 밖에서 관리된다. `posts-meta.json` 이 `[]` 인 것을 버그로 보고 고치려 하지 마라. 빌드는 글 0개로도 통과한다.

---

## 2. 코드 구조

```
src/posts/<카테고리>/<slug>.md   글. 이미지는 같은 폴더의 images/
src/lib/
  posts.ts               Post 인덱스·조회 (메타 즉시 / 본문 lazy)
  posts-meta.json        빌드 산출물 — 직접 수정 금지
  parse-frontmatter.js   자체 frontmatter 파서 (브라우저·Node 공용)
  subcategory-rules.js   카테고리별 tag → 하위 그룹 규칙
scripts/
  build-posts-index.mjs  posts-meta.json 생성 (vite 플러그인이 자동 호출)
  generate-404.mjs       SPA 폴백 404.html 생성 (빌드 후)
```

메타와 본문이 분리돼 있고, 이것이 이 프로젝트의 중심 결정이다. `build-posts-index.mjs` 가 빌드·dev 시작 시 **메타만** 모아 `posts-meta.json` 을 만들고 클라이언트가 정적 import 한다. 본문은 `import.meta.glob` 의 **lazy** 모드라 글당 별도 청크가 되고, `PostDetail` 이 React 19 `use()` 훅으로 소비한다. `PostDetail` 자체도 shiki + KaTeX 때문에 `React.lazy` 로 분리돼 있어, 홈·카테고리 진입 시엔 하이라이터도 수식 엔진도 로드되지 않는다.

**이 분리를 깨지 마라** — 본문 eager glob, `PostDetail` 정적 import, 메타 JSON 대신 런타임 파싱.

---

## 3. 필수: 코드 작성/수정 전 규칙 문서 확인

`docs/` 는 두 축으로 나뉜다. **무엇을 하려는지에 따라 읽는 쪽이 다르다.**

| 폴더 | 누가 읽나 |
| :--- | :--- |
| `docs/writing/` | **글을 쓸 때** — 어디에 어떤 파일명으로, frontmatter 는 어떻게 |
| `docs/engine/` | **블로그를 고칠 때** — 설계 의도·구현·컨벤션 |

코드를 작성하거나 수정하기 전에 **반드시** 아래 표에서 해당 문서를 읽고 규칙을 따라야 한다. 문서를 읽지 않고 규칙을 위반하는 것은 엄격히 금지한다.

### 글 작업

| 작업 영역 | 읽을 문서 |
| :--- | :--- |
| **새 글 추가 — 항상 먼저** | [`writing/categories.md`](docs/writing/categories.md) |
| frontmatter 필드·초안·비공개 | [`writing/frontmatter.md`](docs/writing/frontmatter.md) |
| 이미지·커버·다이어그램 | [`writing/images.md`](docs/writing/images.md) |
| 시리즈로 묶기 | [`writing/series.md`](docs/writing/series.md) |

### 블로그 작업

| 작업 영역 | 읽을 문서 |
| :--- | :--- |
| **UI 를 만지기 전 — 항상 먼저** | [`engine/design.md`](docs/engine/design.md) |
| 레이아웃·타이포·색 토큰·반응형의 구체적 값 | [`engine/layout.md`](docs/engine/layout.md) |
| 콘텐츠 파이프라인 — 메타 인덱스·번들 분리 | [`engine/content.md`](docs/engine/content.md) |
| 마크다운 렌더링 — 코드블록·수식·mermaid·TOC | [`engine/rendering.md`](docs/engine/rendering.md) |
| 라우팅 — 한글 slug·인코딩·404 | [`engine/routing.md`](docs/engine/routing.md) |
| 시리즈 데이터 레이어·UI | [`engine/series.md`](docs/engine/series.md) |
| 배포·`base` 경로·SPA 폴백 | [`engine/deployment.md`](docs/engine/deployment.md) |
| 주석 작성 | [`engine/comments.md`](docs/engine/comments.md) |

**규칙을 여기 복제하지 말고 그 문서를 읽어라.** frontmatter 필드 표, 파서가 멀티라인 배열을 조용히 무시하는 제약, 이미지 상대경로 규칙, 하위 카테고리 우선순위는 전부 `docs/writing/` 이 정본이다.

기능을 추가·변경·제거했으면 **같은 작업 안에서** 해당 문서를 맞춘다. 문서에는 **현재 상태만 적는다** — 예전엔 어땠고 무엇이 바뀌었다는 서술은 git 히스토리가 갖는다.
