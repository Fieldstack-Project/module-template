import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

// AppServices 타입: Fieldstack 메인 레포의 apps/api/src/app.ts 기준
// 모듈을 modules/ 폴더에 배치했을 때의 상대 경로입니다.
import type { AppServices } from '../../../apps/api/src/app';

import { runMigrations } from './migrations';
import type { MyModuleItem } from '../shared/types';

// ─── Auth 타입 확장 ───────────────────────────────────────────────────────────

interface AuthRequest extends Request {
  auth?: { userId: string; sessionId: string };
}

// ─── 입력 스키마 ──────────────────────────────────────────────────────────────

const CreateItemSchema = z.object({
  title: z.string().min(1).max(200),
});

// ─── 라우터 팩토리 ────────────────────────────────────────────────────────────
//
// createRouter(services) 형식으로 export하면 Fieldstack이 서비스를 자동 주입합니다.

export function createRouter(services: AppServices): Router {
  const router = Router();

  // 마이그레이션 (서버 시작 시 1회 실행)
  void runMigrations();

  // ── Auth 미들웨어 ─────────────────────────────────────────────────────────
  function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    services.jwtManager
      .verifyAccessToken(header.slice(7))
      .then((payload) => {
        req.auth = payload;
        next();
      })
      .catch(() => {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
      });
  }

  // ── GET /api/my-module/items ──────────────────────────────────────────────
  router.get('/items', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { getDb } = await import('@fieldstack/core');
      const db = await getDb();

      const rows = await db.query<MyModuleItem>(
        'SELECT id, title, created_at AS "createdAt" FROM my_module_items WHERE user_id = $1 ORDER BY created_at DESC',
        [req.auth!.userId],
      );

      res.json({ success: true, data: { items: rows } });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // ── POST /api/my-module/items ─────────────────────────────────────────────
  router.post('/items', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { title } = CreateItemSchema.parse(req.body);

      const { getDb } = await import('@fieldstack/core');
      const db = await getDb();

      const id = crypto.randomUUID();
      await db.query(
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
  router.delete('/items/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);

      const { getDb } = await import('@fieldstack/core');
      const db = await getDb();

      await db.query(
        'DELETE FROM my_module_items WHERE id = $1 AND user_id = $2',
        [id, req.auth!.userId],
      );

      res.json({ success: true, data: null });
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
