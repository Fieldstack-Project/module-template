import type { MyModuleItem, CreateMyModuleItemRequest } from '../../shared/types';

// API Base — apps/web에서 사용 시 Vite proxy를 통해 /api/my-module → 백엔드로 라우팅됩니다.
const BASE = '/api/my-module';

function getAuthHeader(): Record<string, string> {
  const raw = sessionStorage.getItem('fs_auth');
  if (!raw) return {};
  try {
    const { accessToken } = JSON.parse(raw) as { accessToken?: string };
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  } catch {
    return {};
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(init?.headers ?? {}),
    },
  });
  const json = (await res.json()) as { success: boolean; data: T; error?: string };
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

  deleteItem: (id: string) =>
    apiFetch<null>(`/items/${id}`, { method: 'DELETE' }),
};
