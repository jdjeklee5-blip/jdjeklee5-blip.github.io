# 배포 (Deployment)

> 작성일: 2026-04-05

---

## 1. 역할

빌드된 정적 파일(`dist/`)을 GitHub Pages에 배포하는 프로세스를 정의한다.

블로그는 서버가 필요 없는 정적 사이트이므로, GitHub Pages의 무료 호스팅이 충분하다. 추가 인프라 비용·운영 부담이 없다.

---

## 2. 배포 타겟

| 항목 | 값 |
|------|-----|
| 호스트 | GitHub Pages — **유저 사이트** |
| repo | `jdjeklee5-blip/jdjeklee5-blip.github.io` |
| URL | `https://jdjeklee5-blip.github.io/` (하위 경로 없음) |
| 트리거 | `main` push → GitHub Actions |
| 배포 도구 | `actions/deploy-pages` (`.github/workflows/deploy.yml`) |

**repo명이 `<username>.github.io`인 것이 이 문서 전체를 좌우한다.** 유저 사이트는 하위 경로가 아니라 **루트**에서 서빙되므로, 아래 3·5장의 하위 경로 대응이 전부 불필요해졌다.

### 왜 GitHub Pages인가

| 후보 | 장단점 |
|------|--------|
| **GitHub Pages** | 무료, 소스 관리와 같은 자리, 설정 최소 |
| Vercel | 더 빠른 전파·PR 프리뷰, 커스텀 도메인 쉬움. 필요해지면 전환 |
| Netlify | Vercel과 유사 |
| Cloudflare Pages | 네트워크 우수. 대안 |

개인 블로그 규모에서는 전부 오버스펙. GitHub Pages로 시작하고, 필요 시 Vercel로 전환한다.

---

## 3. Vite `base` 경로

### `base: '/'` 고정이고, 바꾸면 안 된다

```js
// vite.config.js
export default defineConfig({
  plugins: [postsIndexPlugin(), react()],
  base: '/',
})
```

유저 사이트라 루트에서 서빙되므로 환경별 분기도, 하위 경로 대응도 필요 없다.

### 왜 절대 경로여야 하는가

상대경로(`'./'`)는 홈에서 진입하면 잘 동작하는 것처럼 보이지만, **글 상세 URL로 직접 진입할 때 깨진다.**

`/posts/some-slug`로 바로 들어오면 브라우저는 현재 디렉터리를 `/posts/`로 보므로, `./assets/index.js`를 `/posts/assets/index.js`로 요청한다. 그런 파일은 없으니 스크립트가 로드되지 않고 **앱이 아예 마운트되지 못한다.** 홈에서 클릭해 이동할 때는 이미 로드된 상태라 멀쩡해서, 로컬 개발 중에는 드러나지 않는다.

| base | 홈 진입 | 직접 URL 진입 |
|------|--------|-------------|
| `'./'` | 정상 | **깨짐** — 에셋을 `/posts/assets/`에서 찾는다 |
| `'/jinaLog/'` | 깨짐 | 깨짐 — 유저 사이트엔 그런 하위 경로가 없다 |
| **`'/'`** | 정상 | 정상 |

---

## 4. React Router `basename`

**주지 않는다.** `main.tsx`의 `<BrowserRouter>`는 옵션 없이 쓴다.

`basename`은 앱이 하위 경로에 배포될 때 라우터에게 그 접두사를 알려주는 값이다. 루트 서빙이라 접두사가 없으므로 줄 것이 없다. `import.meta.env.BASE_URL`(= `'/'`)을 넘겨도 결과는 같지만, **의미 없는 결합을 만들지 않기 위해** 생략한다. Vite `base`와 라우터가 함께 움직여야 한다는 착각을 남기지 않는 편이 낫다.

---

## 5. SPA 404 폴백

### 문제

GitHub Pages는 기본적으로 SPA 폴백을 지원하지 않는다. `/posts/foo`로 직접 접속하면 GitHub가 `posts/foo/index.html`을 찾다가 진짜 404를 반환해버려 React 앱이 아예 마운트되지 못한다.

새로고침·외부 링크 진입이 전부 깨지므로 블로그에 치명적.

### 해결: 404.html 트릭

1. `dist/404.html`에 루트 `index.html`과 동일한 셸을 넣는다
2. GitHub Pages는 매칭되는 파일이 없을 때 `404.html`을 서빙한다
3. 그 내용이 `index.html`과 같으므로 SPA가 마운트되고, React Router가 현재 URL을 읽어 정상 라우팅한다

### 자동화 — `generate-404.mjs`

`public/404.html`을 손으로 두지 않는다. **`scripts/generate-404.mjs`가 빌드 후 `dist/index.html`을 `dist/404.html`로 복사한다.**

```json
"scripts": {
  "build": "vite build && node scripts/generate-404.mjs"
}
```

**왜 셸 `cp`가 아니라 Node 스크립트인가**: Actions 러너(ubuntu)와 로컬(Windows)에서 같은 명령이 돌아야 하기 때문이다.

셸 의존성도 없다 — Actions 러너(ubuntu)와 로컬(Windows)에서 같은 Node 스크립트가 돈다.

---

## 6. 빌드/배포 명령

| 명령 | 설명 |
|------|------|
| `pnpm dev` | 로컬 개발 서버 (hot reload) |
| `pnpm build` | `dist/` 생성 + 404.html |
| `pnpm preview` | 빌드 결과 로컬 확인 (push 전 필수) |
| ~~`pnpm deploy`~~ | **쓰지 않는다.** 8장 참조 |

### 빌드 파이프라인 상세

```
pnpm build
  = vite build
  → node scripts/generate-404.mjs       (dist/index.html → dist/404.html)
```

404 생성은 `vite build` 이후 실행된다.

### 배포 체크리스트

1. `pnpm install` → `npx tsc --noEmit` → `pnpm build` 전부 통과 확인
2. `pnpm preview`로 라우팅·이미지·코드블록·수식·mermaid 확인
3. **직접 링크 접속(`/posts/...`) 테스트** — 404 폴백과 `base` 경로를 한 번에 검증하는 지점이다
4. 새 글·수정 사항 git commit
5. `git push origin main` → Actions가 빌드·배포
6. 1~2분 대기 후 실제 URL에서 확인, 직접 링크 재테스트

`pnpm install`을 건너뛴 채 `npx tsc --noEmit`을 돌리면 npm이 레지스트리에서 무관한 `tsc` 패키지를 받아와 **통과한 것처럼 보인다.** 검증된 것이 없는 상태로 push하게 된다.

Actions는 워킹 트리가 아니라 **push된 커밋**을 빌드한다. 커밋하지 않은 변경은 배포에 반영되지 않아, 로컬에서 확인한 것과 배포된 것이 달라진다. 절차는 `/deploy` 스킬에 있다.

---

## 7. 커스텀 도메인 (선택, 2차)

### 전환 절차

1. `public/CNAME` 파일에 도메인 한 줄 (`blog.example.com`)
2. DNS에서 GitHub Pages IP로 A 레코드 또는 CNAME 설정
3. Vite `base`를 `/`로 되돌리기 (`vite.config.js`)
4. GitHub repo Settings → Pages에서 Custom domain 입력
5. "Enforce HTTPS" 체크

### 지금 안 하는 이유

- 도메인 비용 + 연간 갱신 부담
- 블로그가 자리 잡기 전에 URL을 바꾸면 외부 링크가 깨짐
- GitHub 하위 도메인도 충분히 프로페셔널

글 10~20개 쌓이고 주소 공유가 잦아지면 검토.

---

## 8. GitHub Actions 자동 배포

`main`에 push하면 `.github/workflows/deploy.yml`이 실행된다.

```
checkout → pnpm/action-setup@v4 (v10) → setup-node@v4 (20, cache: pnpm)
  → pnpm install --frozen-lockfile
  → pnpm build
  → actions/upload-pages-artifact@v3 (dist)
  → actions/deploy-pages@v4
```

`concurrency: { group: pages, cancel-in-progress: false }`라 배포가 겹치면 취소하지 않고 줄을 세운다. 배포는 부분 적용되면 안 되기 때문이다.

### 왜 자동 배포인가

수동 배포는 `pnpm build` → `pnpm preview` → `pnpm deploy` 3단계를 매번 반복해야 하고, 마지막 단계를 빠뜨리면 **커밋만 되고 사이트는 그대로인 상태**가 조용히 생긴다. push 하나로 통일하면 커밋과 배포가 어긋날 수 없다.

`--frozen-lockfile`을 쓰므로 `package.json`을 고쳤으면 `pnpm-lock.yaml`도 **함께 커밋해야** 한다. 아니면 install 단계에서 실패한다.

### `gh-pages` 패키지는 쓰지 않는다

`package.json`에 `deploy: gh-pages -d dist` 스크립트와 devDependency가 남아 있지만 **실행하지 않는다.** Actions와 병행하면 배포 경로가 둘로 갈리고, `gh-pages` 브랜치 산출물과 Actions artifact가 어긋난 채로 어느 쪽이 서빙되는지 헷갈리게 된다.

---

## 9. 연관 도메인

| 도메인 | 관계 |
|--------|------|
| **Routing** | `basename`·SPA 404 폴백이 라우터와 직접 연결 |
| **Content** | 새 글 추가 후 재빌드·재배포 필요 (빌드 타임 번들이므로) |
