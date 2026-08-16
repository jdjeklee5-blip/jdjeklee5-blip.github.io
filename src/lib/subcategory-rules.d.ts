// subcategory-rules.js는 빌드 스크립트(Node)와 클라이언트가 함께 import 하므로
// 순수 JS로 유지한다. 타입만 여기서 선언한다.

export interface SubcategoryRule {
  slug: string
  label: string
  tags: string[]
}

export declare const SUBCATEGORY_RULES: Record<string, SubcategoryRule[]>

/** 카테고리 + 태그 배열 → 매칭되는 첫 rule (없으면 null) */
export declare function getSubcategory(
  category: string,
  tags: string[]
): SubcategoryRule | null

/** 카테고리의 전체 subcategory 정의 (UI 네비에서 사용) */
export declare function getSubcategoriesForCategory(
  category: string
): SubcategoryRule[]
