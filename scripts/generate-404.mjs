/**
 * SPA 404 폴백 생성기
 *
 * GitHub Pages는 SPA 폴백을 지원하지 않는다. `/posts/foo`로 직접 진입하면
 * 그런 경로의 파일이 없으니 진짜 404를 반환해 React 앱이 마운트조차 되지 못한다.
 * 매칭되는 파일이 없을 때 Pages가 서빙하는 `404.html`에 `index.html`과 같은 셸을
 * 넣어두면 앱이 뜨고, React Router가 현재 URL을 읽어 정상 라우팅한다.
 *
 * 실행: pnpm build의 마지막 단계 (vite build 이후)
 */

import { copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, '../dist')

await copyFile(path.join(DIST, 'index.html'), path.join(DIST, '404.html'))
console.log('✔ 404.html 생성 (SPA 폴백)')
