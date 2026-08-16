// ─────────────────────────────────────────
// 하위 카테고리 (subcategory) 규칙
//
// 설계 맥락 (docs/specs/content.md §8 옵션 D의 보완):
// - 물리 구조는 "상위만 폴더, 하위는 태그"로 평탄하다. 폴더를 더 파지 않고
//   **태그를 재활용**해 UI 레벨에서만 하위 그룹을 만든다
// - 카테고리별 ordered rule 배열. 글의 tags를 위에서부터 대조해 **첫 매치**로 분류
// - 그래서 **더 구체적인 규칙이 앞에** 와야 한다. 넓은 태그(언어명 등)는 뒤로
//
// 규칙을 중간에 끼워넣거나 순서를 바꾸면 기존 글이 조용히 다른 그룹으로 옮겨간다.
// 에러가 나지 않으므로 바꾼 뒤에는 posts-meta.json의 subcategory를 전수 확인할 것
//
// 매칭되는 글이 0개인 규칙은 UI에서 자동으로 빠지므로(posts.ts의
// getSubcategoriesByCategory), 앞으로 쓸 주제를 미리 선언해둬도 빈 그룹은 보이지 않는다
//
// 이전 카테고리(`개념-정리`·`코테`·`트러블-슈팅`)의 규칙 27개는 그 글들이 저장소에서
// 빠지면서 함께 제거했다. 옛 글을 되살릴 일이 생기면 git 히스토리에서 가져온다
// ─────────────────────────────────────────

/**
 * @typedef {{ slug: string, label: string, tags: string[] }} SubcategoryRule
 */

/** @type {Record<string, SubcategoryRule[]>} */
export const SUBCATEGORY_RULES = {
  // SCM 은 Supply Chain Management. 형상관리(Source Control)가 아니다 —
  // `git` 태그를 여기에 넣지 말 것
  '공부': [
    { slug: 'scm',        label: 'SCM',        tags: ['scm', 'supply-chain', '공급망'] },
    { slug: 'logistics',  label: '유통·물류',   tags: ['물류', '유통', 'logistics', 'distribution'] },
    { slug: 'erp',        label: 'ERP',        tags: ['erp', 'sap'] },
    // 넓은 태그(data)가 있어 맨 뒤. 위 그룹에 먼저 걸린 글은 여기로 오지 않는다
    { slug: 'sql-data',   label: 'SQL / Data', tags: ['sql', 'data', 'database', 'databases'] },
  ],

  // 프로젝트는 "무슨 주제냐"가 아니라 "어느 프로젝트냐"로 갈린다.
  // 주제 목록으로 미리 채우지 않고, 프로젝트가 하나 생길 때마다 한 줄 추가한다.
  // 글에는 프로젝트 식별 태그 하나(예: `toodak`)를 일관되게 붙인다.
  //
  // 한 프로젝트 안에서 글이 순서대로 이어지면(소개 → 설계 → 회고)
  // 하위 그룹이 아니라 series 를 쓴다 — 이전/다음 편 네비와 목차가 자동으로 붙는다.
  // docs/writing/series.md
  '프로젝트': [
    { slug: 'toodak', label: 'Toodak', tags: ['toodak'] },
    { slug: 'scm',    label: 'SCM',    tags: ['scm'] },
  ],

  '기업-산업분석': [
    { slug: 'beauty', label: 'Beauty', tags: ['뷰티', 'beauty', '화장품'] },
  ],
}

// 카테고리 + 태그 배열 → 매칭되는 첫 rule (없으면 null)
// 빌드 타임에 build-posts-index.mjs가 호출해서 각 글의 subcategory 필드를 채움
export function getSubcategory(category, tags) {
  const rules = SUBCATEGORY_RULES[category]
  if (!rules || rules.length === 0) return null
  for (const rule of rules) {
    if (rule.tags.some((t) => tags.includes(t))) {
      return rule
    }
  }
  return null
}

// 카테고리의 전체 subcategory 정의 (UI 네비에서 사용)
export function getSubcategoriesForCategory(category) {
  return SUBCATEGORY_RULES[category] || []
}
