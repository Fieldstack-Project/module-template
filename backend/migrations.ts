import path from 'node:path';

// DB 마이그레이션 실행
// db/migrations/ 폴더 내 .sql 파일을 파일명 오름차순으로 실행합니다.
export async function runMigrations(): Promise<void> {
  try {
    const { getDb, FileMigrationRunner } = await import('@fieldstack/core');
    const db = await getDb();

    const migrationsDir = path.join(__dirname, 'db', 'migrations');

    // 두 번째 인자(namespace)는 모듈 이름과 동일하게 맞춰주세요.
    // migrations 테이블에서 다른 모듈과 충돌을 방지합니다.
    const runner = new FileMigrationRunner(db, 'my-module', migrationsDir);
    await runner.run();
  } catch (err) {
    console.error('[my-module] migration failed:', err);
  }
}
