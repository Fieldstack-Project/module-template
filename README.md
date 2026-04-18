# Fieldstack Module Template

Fieldstack 모듈을 만들기 위한 기본 템플릿입니다.  
참조 구현: `modules/ledger/` (Fieldstack 메인 레포)

---

## 폴더 구조

```
my-module/
├── module.json                  ← 필수. 모듈 매니페스트
├── shared/
│   └── types.ts                 ← backend ↔ frontend 공통 타입
├── backend/
│   ├── index.ts                 ← 진입점. createRouter() export
│   └── migrations/
│       └── 001_init.sql         ← DB 마이그레이션 (크로스-DB 토큰 사용)
└── frontend/
    └── src/
        ├── index.ts             ← View export
        ├── MyModuleView.tsx     ← 메인 React 컴포넌트
        ├── MyModuleView.css     ← 스타일 (--fs-* 토큰)
        └── api.ts               ← API 호출 헬퍼
```

---

## 사용 방법

### 1. 템플릿 복사

```
Fieldstack/modules/my-module/
```

### 2. module.json 수정

```json
{
  "name": "my-module",
  "version": "0.1.0",
  "displayName": "내 모듈",
  "description": "모듈 설명",
  "enabled": true,
  "dependencies": [],
  "routes": {
    "frontend": "/my-module",
    "api": "/api/my-module"
  }
}
```

- `name`: 고유 식별자 (디렉터리 이름과 일치)
- `displayName`: 사이드바에 자동 표시되는 이름
- `routes.api`: Express 라우터 마운트 경로
- `routes.frontend`: hash 라우트 (`#my-module`)
- `enabled: false`로 설정하면 서버 시작 시 완전히 무시됨

### 3. 이름 치환

`my-module` / `MyModule` / `my_module`을 실제 모듈 이름으로 일괄 변경합니다.

### 4. Fieldstack 앱에 View 연결

`apps/web/src/main.tsx`에서 3곳 수정:

```tsx
// 1. import 추가
import { MyModuleView } from '../../../modules/my-module/frontend/src';

// 2. MODULE_ROUTES 배열에 추가
const MODULE_ROUTES: string[] = ["ledger", "my-module"];

// 3. 렌더 분기에 추가
{effectiveRoute === "my-module" && <MyModuleView />}
```

**사이드바는 자동 구성됩니다.** `AppShell.tsx` 수정 불필요.

---

## 백엔드 규칙

### ⚠️ @fieldstack/core 값 import 금지

`modules/` 위치에서 `@fieldstack/core` 런타임 import는 경로 해석 실패.

- `getDb()` → 사용 불가. `services.db`로 주입받아 사용
- `FileMigrationRunner` → 불필요. 마이그레이션은 자동 실행됨
- `JwtSessionManagerImpl` → duck-type 인터페이스로 대체 (index.ts 참조)

`import type`은 런타임에 제거되므로 허용됩니다.

### 마이그레이션

`backend/migrations/*.sql` 파일을 작성하면 서버 시작 시 자동 실행됩니다.  
크로스-DB 토큰:

| 토큰 | 용도 |
|------|------|
| `{{UUID_PRIMARY_KEY}}` | UUID 기본키 |
| `{{BOOLEAN_FALSE}}` | 기본값 false 불리언 |
| `{{NOW}}` | 현재 시각 기본값 |

### HTTP 응답 규칙

- `GET` / `PUT`: `200 { success: true, data: { ... } }`
- `POST`: `201 { success: true, data: { ... } }`
- `DELETE`: **`204` (본문 없음)**

---

## 프론트엔드 규칙

- `@fieldstack/controls` 컴포넌트 사용 (Button, DataTable, Modal, Alert 등)
- CSS 토큰: `var(--text)`, `var(--bg-surface)`, `var(--border)`, `var(--primary)`, `var(--err)` 등 — `--fs-*` 접두사는 존재하지 않음, 사용 금지
- 인증 토큰: `sessionStorage.getItem('fs_token')` — `fs_auth` 아님
- API 호출: `apiCall()` from `@fieldstack/core/browser` 사용 — 인증 헤더·응답 파싱·204 처리 포함

---

## 코드 작성 규칙

- **주석 필수**: 영어 또는 한국어로 주석을 작성할 것. 로직이 자명하지 않은 코드에는 반드시 주석을 달아야 한다.
  - 자세한 설명은 docs 사이트를 참고하도록 유도해도 무방함
  - 비개발자 관리자도 코드를 대략적으로 파악할 수 있어야 하기 때문에 주석을 생략하지 말 것
