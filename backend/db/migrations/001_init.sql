-- my-module 초기 스키마
-- 파일명 규칙: NNN_description.sql (숫자 오름차순으로 실행됨)

CREATE TABLE IF NOT EXISTS my_module_items (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  title      TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_my_module_items_user ON my_module_items(user_id);
