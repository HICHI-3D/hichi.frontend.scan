/**
 * API 베이스 URL.
 *
 * `import.meta.env.VITE_API_BASE_URL` 가 있으면 그걸 쓰고,
 * 없으면 dev 환경 기본값 (`http://localhost:8000`) 으로 폴백.
 *
 * 모든 API 호출은 이 베이스 + '/api/...' 형태로 조합한다.
 */
const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

export const API_BASE_URL = (fromEnv && fromEnv.length > 0
  ? fromEnv
  : 'http://localhost:8000'
).replace(/\/$/, '');

export const buildUrl = (path: string): string => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
};
