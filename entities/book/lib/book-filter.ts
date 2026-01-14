export const EXCLUDED_KEYWORDS = [
  '만화', '코믹', 'comic',
  '흔한남매', '에그박사', '엉덩이 탐정', '마법천자문', '쿠키런', 
  'who?', 'why?', '설민석', '그리스 로마 신화', '놓지 마', 
  '총몇명', '민쩔미', '급식왕', '방울이', '최강의 실험왕', '내일은 실험왕'
];

/**
 * 책 제목이 제외 키워드를 포함하는지 확인합니다.
 * @param title 책 제목
 * @returns 제외 대상이면 true, 아니면 false
 */
export function isExcludedBook(title: string): boolean {
  if (!title) return false;
  const normalizedTitle = title.toLowerCase();
  return EXCLUDED_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword.toLowerCase()));
}
