# Fieldstack Module Template

Fieldstack 모듈을 만들기 위한 기본 템플릿입니다.

## 폴더 구조

```
my-module/
├── module.json              ← Fieldstack 모듈 매니페스트 (필수)
├── shared/
│   └── types.ts             ← backend ↔ frontend 공통 타입
├── backend/
│   ├── index.ts             ← Express 라우터 (createRouter 함수 export)
│   ├── migrations.ts        ← DB 마이그레이션 실행 헬퍼
│   └── db/
│       └── migrations/
│           └── 001_init.sql ← 초기 스키마
└── frontend/
    └── src/
        ├── index.ts          ← View 컴포넌트 export
        ├── MyModuleView.tsx  ← 메인 React 컴포넌트
        ├── MyModuleView.css  ← 컴포넌트 스타일
        └── api.ts            ← 백엔드 API 호출 함수
```

## 사용 방법

### 1. 템플릿 복사

`module-template` 폴더를 복사해 이름을 모듈 이름으로 바꿉니다.

```
Fieldstack/modules/my-module/
```

### 2. module.json 수정

```json
{
  "name": "my-module",
  "version": "0.1.0",
  "enabled": true,
  "dependencies": [],
  "routes": {
    "frontend": "my-module",
    "api": "/api/my-module"
  }
}
```

- `name`: 모듈 고유 식별자 (디렉터리 이름과 일치 권장)
- `routes.api`: Express 라우터가 마운트될 경로
- `routes.frontend`: 앱 내 hash 라우트 (`#my-module`)
- `dependencies`: 이 모듈이 필요로 하는 다른 모듈 이름 목록
- `enabled: false`로 설정하면 서버 시작 시 무시됨

### 3. 이름 치환

`my-module` / `MyModule` / `my_module` 을 실제 모듈 이름으로 일괄 변경합니다.

### 4. Fieldstack 앱에 View 연결

`apps/web/src/main.tsx`의 라우트 분기에 모듈 View를 추가합니다.

```tsx
// apps/web/src/main.tsx
import { MyModuleView } from '../../modules/my-module/frontend/src';

// effectiveRoute 분기 안에
case 'my-module':
  return <MyModuleView />;
```

사이드바 메뉴는 `apps/web/src/components/AppShell.tsx`에 추가하세요.

## 백엔드 규칙

- `backend/index.ts`는 반드시 `createRouter(services: AppServices): Router`를 named export해야 합니다.
- 인증이 필요한 라우트는 `services.jwtManager.verifyAccessToken()`으로 토큰을 검증합니다.
- DB 접근은 `getDb()` 싱글턴을 사용합니다 (`@fieldstack/core`).
- 모듈 전용 마이그레이션 namespace는 모듈 이름과 동일하게 설정하세요 (`FileMigrationRunner(db, 'my-module', dir)`).

## 프론트엔드 규칙

- `@fieldstack/controls` 컴포넌트를 사용합니다 (Button, DataTable, Input 등).
- CSS 토큰은 `var(--text)`, `var(--bg-surface)`, `var(--accent)` 등 전역 토큰을 사용합니다.
- API 인증 헤더는 `sessionStorage`의 `fs_auth` 키에서 `accessToken`을 읽어 주입합니다.
- `@fieldstack/core`를 import할 때는 반드시 `@fieldstack/core/browser` 경로를 사용합니다.
