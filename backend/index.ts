import type { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';

import { z } from 'zod';

// ⚠️ @fieldstack/core 값(value) import 금지.
//    modules/ 위치에서 런타임 import 시 경로 해석 실패.
//    - DB: services.db 주입받아 사용
//    - 마이그레이션: module-registry.ts가 backend/migrations/ 자동 실행
//    - JwtManager: 아래 duck-type 인터페이스로 대체
import type { DbProvider } from '@fieldstack/core' with { "resolution-mode": "import" };

import type { MyModuleItem } from '../shared/types';

// ─── Duck-type 인터페이스 ──────────────────────────────────────────────────────

type JwtManager = {
  verifyAccessToken(token: string): Promise<{ userId: string; email: string }>;
};

interface ModuleServices {
  jwtManager: JwtManager;
  db: DbProvider;
}

// ─── 입력 스키마 ──────────────────────────────────────────────────────────────

const CreateItemSchema = z.object({
  title: z.string().min(1).max(200),
});

// ─── Auth 미들웨어 ────────────────────────────────────────────────────────────

function createAuth(jwtManager: JwtManager) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    try {
      req.auth = await jwtManager.verifyAccessToken(header.slice(7));
      next();
    } catch {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
  };
}

// ─── 라우터 팩토리 ────────────────────────────────────────────────────────────
//
// createRouter(services) 형식으로 export하면 Fieldstack이 자동으로 호출합니다.
// 마이그레이션(backend/migrations/*.sql)은 module-registry.ts가 자동 실행합니다.

export function createRouter(services: ModuleServices): Router {
  const { Router } = require('express') as typeof import('express');
  const router = Router();
  const auth = createAuth(services.jwtManager);

  // ── GET /api/my-module/items ──────────────────────────────────────────────
  router.get('/items', auth, async (req: Request, res: Response) => {
    try {
      const rows = await services.db.query<MyModuleItem>(
        'SELECT id, title, created_at AS "createdAt" FROM my_module_items WHERE user_id = $1 ORDER BY created_at DESC',
        [req.auth!.userId],
      );
      res.json({ success: true, data: { items: rows } });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // ── POST /api/my-module/items ─────────────────────────────────────────────
  router.post('/items', auth, async (req: Request, res: Response) => {
    try {
      const { title } = CreateItemSchema.parse(req.body);

      const id = crypto.randomUUID();
      await services.db.query(
        'INSERT INTO my_module_items (id, user_id, title) VALUES ($1, $2, $3)',
        [id, req.auth!.userId, title],
      );

      res.status(201).json({ success: true, data: { id, title } });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: err.errors[0]?.message });
        return;
      }
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // ── DELETE /api/my-module/items/:id ──────────────────────────────────────
  // 성공 시 204 No Content 반환 (본문 없음)
  router.delete('/items/:id', auth, async (req: Request, res: Response) => {
    try {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);

      await services.db.query(
        'DELETE FROM my_module_items WHERE id = $1 AND user_id = $2',
        [id, req.auth!.userId],
      );

      res.status(204).end();
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: err.errors[0]?.message });
        return;
      }
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  return router;
}
