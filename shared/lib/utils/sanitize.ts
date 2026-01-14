import DOMPurify from 'isomorphic-dompurify';

/**
 * HTML 문자열을 새니타이징하여 XSS 공격을 방어합니다.
 * @param dirty - 새니타이징할 HTML 문자열
 * @returns 안전한 HTML 문자열
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'span', 'p'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * 일반 텍스트만 추출 (모든 HTML 태그 제거)
 * @param html - HTML 문자열
 * @returns 텍스트만 추출된 문자열
 */
export function stripHTML(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}
