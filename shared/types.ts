// ─── Shared types ────────────────────────────────────────────────────────────
// backend ↔ frontend 양쪽에서 import 가능한 공통 타입만 정의합니다.
// Node.js 전용 패키지(fs, path, express 등)는 이 파일에 import하지 마세요.

export interface MyModuleItem {
  id: string;
  title: string;
  createdAt: string; // ISO 8601
}

export interface CreateMyModuleItemRequest {
  title: string;
}
