-- my-module 초기 스키마
-- 파일명 규칙: NNN_description.sql (숫자 오름차순으로 실행됨)
--
-- 크로스-DB 토큰 (PostgreSQL / SQLite 자동 치환):
--   {{UUID_PRIMARY_KEY}} → UUID PRIMARY KEY DEFAULT gen_random_uuid() | TEXT PRIMARY KEY
--   {{BOOLEAN_FALSE}}    → BOOLEAN NOT NULL DEFAULT FALSE             | INTEGER NOT NULL DEFAULT 0
--   {{NOW}}              → TIMESTAMP WITH TIME ZONE DEFAULT NOW()     | TEXT DEFAULT (datetime('now'))

CREATE TABLE IF NOT EXISTS my_module_items (
  id         {{UUID_PRIMARY_KEY}},
  user_id    TEXT NOT NULL,
  title      TEXT NOT NULL,
  created_at {{NOW}},
  updated_at {{NOW}}
);

CREATE INDEX IF NOT EXISTS idx_my_module_items_user ON my_module_items(user_id);
