# 아키텍처

## 폴더 구조

```
src/
  pages/          # 라우트 단위 페이지 컴포넌트
  components/
    layout/       # AppLayout, AppHeader, AppSidebar, PageHeader, ProtectedRoute
    ui/           # shadcn/ui 기반 공통 컴포넌트
    pages/        # 페이지별 도메인 컴포넌트
      dashboard/  # 대시보드 위젯
      commission/ # 의뢰 관련 컴포넌트
      score/      # 악보/편성 관련 컴포넌트
      scores/     # ScoreList 관련 컴포넌트
      sales/      # 매출 통계 컴포넌트
      recommend/  # 음악 추천 컴포넌트
      uploads/    # Excel 업로드 컴포넌트
  api/
    auth/         # Supabase 인증 API
    commission/   # 의뢰 queries / mutations
    score/        # 악보·편성 queries / mutations
    stats/        # 매출 통계 queries
    recommendation/ # 음악 추천 API
  types/          # TypeScript 타입 정의
  hooks/          # 커스텀 React 훅
  utils/          # 유틸 함수 (supabase 클라이언트, query-client 등)
  constants/      # 상수 (상태 설정, 네비게이션, 악기 목록 등)
  lib/            # 공통 라이브러리 유틸 (cn 등)
  provider/       # React Context Provider (Auth, Theme)
  data/           # 정적 데이터
  mock/           # 목 데이터 (개발용)
  styles/         # 전역 스타일
```

---

## 라우트 구조

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/login` | Login | 로그인 (공개) |
| `/register` | Register | 회원가입 (공개) |
| `/` | Index | 대시보드 (보호) |
| `/commissions` | CommissionList | 의뢰 목록 (보호) |
| `/new` | CommissionRegister | 의뢰 등록 (보호) |
| `/commissions/:id` | CommissionDetail | 의뢰 상세 (보호) |
| `/commissions/:id/edit` | CommissionEdit | 의뢰 수정 (보호) |
| `/files` | Files | 파일 관리 (보호) |
| `/scores/new` | ScoreRegister | 악보 등록 (보호) |
| `/scores/:scoreId/arrangements/:arrangementId` | ScoreDetail | 편성 상세 (보호) |
| `/stats` | SalesStats | 매출 통계 (보호) |
| `/files/excel/:uploadId` | ExcelUploadDetail | Excel 업로드 상세 (보호) |
| `/calendar` | CalendarView | 캘린더 (보호) |
| `/settings` | Settings | 설정 (보호) |
| `*` | NotFound | 404 (보호) |

> 보호 라우트는 `ProtectedRoute` 컴포넌트로 감싸며, 미인증 시 `/login`으로 리다이렉트.

---

## 네비게이션 메뉴

사이드바(`AppSidebar`)에 표시되는 주요 메뉴:

| 메뉴 | URL |
|------|-----|
| 대시보드 | `/` |
| 캘린더 | `/calendar` |
| 의뢰 목록 | `/commissions` |
| 매출 통계 | `/stats` |
| 파일 관리 | `/files` |

---

## 상태 관리

- **서버 상태**: TanStack Query v5 — `useAppQuery` 커스텀 훅으로 래핑
- **인증 상태**: `AuthContext` (`src/provider/AuthContext.tsx`)
- **로컬 UI 상태**: React `useState` / `useReducer`
- **오버레이**: `overlay-kit` — 모달/다이얼로그를 명령형으로 제어

---

## API 패턴

각 도메인(`commission`, `score`, `stats`)은 `queries.ts` + `mutations.ts`로 분리:

```
api/commission/
  queries.ts    # TanStack Query queryOptions 정의
  mutations.ts  # useMutation 훅 정의
```

Supabase 클라이언트는 `src/utils/supabase.ts`에서 싱글톤으로 관리.

---

## 인증

- Supabase Auth (이메일/패스워드)
- `AuthProvider`가 세션 변화를 구독하여 `AuthContext`에 반영
- `ProtectedRoute`로 인증이 필요한 라우트 보호
- Supabase RLS로 사용자별 데이터 격리 (멀티유저 대비)
