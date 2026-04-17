import type { MyModuleItem, CreateMyModuleItemRequest } from '../../shared/types';

const BASE = '/api/my-module';

// 인증 토큰은 fs_token 키에서 직접 읽습니다 (fs_auth 아님).
function getToken(): string {
  return sessionStorage.getItem('fs_token') ?? '';
}

// res.text() 먼저 읽어서 빈 응답(204 등)을 안전하게 처리합니다.
// res.json()은 빈 본문에서 "Unexpected end of JSON input" 오류를 던집니다.
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!text) return undefined as T;
  const json = JSON.parse(text) as { success: boolean; data: T; error?: string };
  if (!json.success) throw new Error(json.error ?? 'API error');
  return json.data;
}

export const myModuleApi = {
  listItems: () =>
    apiFetch<{ items: MyModuleItem[] }>('/items').then((d) => d.items),

  createItem: (body: CreateMyModuleItemRequest) =>
    apiFetch<MyModuleItem>('/items', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // DELETE → 204 No Content. apiFetch가 빈 응답을 undefined로 반환합니다.
  deleteItem: (id: string) =>
    apiFetch<undefined>(`/items/${id}`, { method: 'DELETE' }),
};
