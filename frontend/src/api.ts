import { apiCall } from '@fieldstack/core/browser';

import type { MyModuleItem, CreateMyModuleItemRequest } from '../../shared/types';

const BASE = '/api/my-module';

// apiCall은 @fieldstack/core/browser에서 제공하는 표준 인증 API 호출 유틸리티입니다.
// - Authorization 헤더 자동 첨부 (fs_token)
// - 401 시 리프레시 토큰으로 자동 갱신 후 재시도
// - Fieldstack 응답 형식 { success, data, error } 자동 파싱
// - 빈 응답(204 등)은 undefined로 반환
export const myModuleApi = {
  listItems: () =>
    apiCall<{ items: MyModuleItem[] }>(`${BASE}/items`).then((d) => d.items),

  createItem: (body: CreateMyModuleItemRequest) =>
    apiCall<MyModuleItem>(`${BASE}/items`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // DELETE → 204 No Content. apiCall이 빈 응답을 undefined로 반환합니다.
  deleteItem: (id: string) =>
    apiCall<undefined>(`${BASE}/items/${id}`, { method: 'DELETE' }),
};
