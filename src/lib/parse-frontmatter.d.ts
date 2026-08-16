// parse-frontmatter.js는 빌드 스크립트(Node)와 클라이언트가 같은 모듈을 공유해야 하므로
// 순수 JS로 유지한다. 타입만 여기서 선언한다.

export interface ParseResult {
  data: Record<string, unknown>
  content: string
}

export declare function parseFrontmatter(raw: string): ParseResult
