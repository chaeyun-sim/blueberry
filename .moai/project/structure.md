# 블루베리 프로젝트 구조

## 전체 디렉토리 레이아웃

```
blueberry/
├── src/                           # 소스 코드 루트
│   ├── api/                       # 데이터 페칭 및 API 로직 (도메인별 조직)
│   │   ├── auth/                  # 인증
│   │   │   ├── index.ts
│   │   │   └── (로그인, 로그아웃 함수)
│   │   ├── commission/            # 의뢰 관리
│   │   │   ├── queries.ts         # 의뢰 조회 쿼리
│   │   │   ├── mutations.ts       # 의뢰 생성/수정/삭제
│   │   │   ├── queryKeys.ts       # React Query 키 정의
│   │   │   └── index.ts           # 배럴 export
│   │   ├── score/                 # 악보 관리
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   ├── queryKeys.ts
│   │   │   └── index.ts
│   │   ├── stats/                 # 매출 통계
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts       # 수동 매출 항목 추가
│   │   │   ├── queryKeys.ts
│   │   │   └── index.ts
│   │   └── recommendation/        # 음악 추천
│   │       ├── queries.ts         # Soundpost 통합
│   │       ├── queryKeys.ts
│   │       └── index.ts
│   │
│   ├── components/                # UI 컴포넌트 (React)
│   │   ├── ErrorBoundary.tsx      # Global Error Boundary
│   │   ├── ErrorFallback/         # 에러 폴백 UI
│   │   ├── QueryErrorUI/          # React Query 에러 UI
│   │   ├── layout/                # 레이아웃 컴포넌트
│   │   │   ├── AppLayout.tsx      # 메인 레이아웃
│   │   │   ├── Sidebar.tsx        # 네비게이션 사이드바
│   │   │   ├── Header.tsx         # 헤더
│   │   │   ├── ProtectedRoute.tsx # 권한 확인 라우트
│   │   │   └── Navigation.tsx     # 라우트 네비게이션
│   │   ├── pages/                 # 페이지별 컴포넌트 (Pages 폴더와 분리)
│   │   │   ├── commissions/       # 의뢰 관련 페이지 컴포넌트
│   │   │   │   ├── CommissionForm.tsx
│   │   │   │   ├── CommissionList.tsx
│   │   │   │   └── CommissionDetail.tsx
│   │   │   ├── scores/            # 악보 관련 페이지 컴포넌트
│   │   │   │   ├── ScoreForm.tsx
│   │   │   │   ├── ScoreList.tsx
│   │   │   │   ├── ScoreTab.tsx
│   │   │   │   ├── FolderRow.tsx
│   │   │   │   └── BreadCrumb.tsx
│   │   │   ├── stats/             # 통계 관련 컴포넌트
│   │   │   │   ├── SalesChart.tsx
│   │   │   │   └── StatsSummary.tsx
│   │   │   ├── uploads/           # Excel 업로드 컴포넌트
│   │   │   │   ├── ExcelTab.tsx
│   │   │   │   ├── UploadFolderRow.tsx
│   │   │   │   └── DataPreview.tsx
│   │   │   └── calendar/          # 캘린더 컴포넌트
│   │   │       └── CalendarGrid.tsx
│   │   └── ui/                    # shadcn/ui 컴포넌트 (자동 생성)
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       ├── toast.tsx
│   │       ├── tooltip.tsx
│   │       ├── sonner.tsx
│   │       └── ... (30+ shadcn 컴포넌트)
│   │
│   ├── pages/                     # 라우트 페이지 (라우팅 구조와 동일)
│   │   ├── Index.tsx              # 홈 대시보드
│   │   ├── CommissionList.tsx     # 의뢰 목록
│   │   ├── CommissionRegister.tsx # 의뢰 신규 등록
│   │   ├── CommissionDetail.tsx   # 의뢰 상세
│   │   ├── CommissionEdit.tsx     # 의뢰 편집
│   │   ├── ScoreDetail.tsx        # 악보 상세
│   │   ├── ScoreRegister.tsx      # 악보 신규 등록
│   │   ├── Files.tsx              # 파일 관리 (탐색기)
│   │   ├── SalesStats.tsx         # 매출 통계
│   │   ├── CalendarView.tsx       # 캘린더 뷰
│   │   ├── MusicRecommend.tsx     # 음악 추천
│   │   ├── ExcelUploadDetail.tsx  # Excel 업로드 상세
│   │   ├── Settings.tsx           # 사용자 설정
│   │   ├── Login.tsx              # 로그인
│   │   └── NotFound.tsx           # 404 페이지
│   │
│   ├── hooks/                     # 커스텀 React Hooks
│   │   ├── use-auth.ts            # 인증 상태 & 로그인/로그아웃
│   │   ├── use-app-query.ts       # 앱 전체 쿼리 설정
│   │   ├── use-push.ts            # 푸시 알림 관리
│   │   ├── use-mobile.ts          # 모바일 기기 감지
│   │   ├── use-theme.ts           # 테마 (Light/Dark) 전환
│   │   ├── use-worked-songs.ts    # 작업한 곡 목록 조회
│   │   ├── use-song-field.ts      # 곡 필드 입력 (폼)
│   │   ├── use-soundpost-check.ts # Soundpost API 호출
│   │   ├── use-remove-instrument.ts # 악기 제거
│   │   └── use-live-clock.ts      # 실시간 시계
│   │
│   ├── types/                     # TypeScript 타입 정의
│   │   ├── commission.ts          # Commission, Arrangement 타입
│   │   ├── score.ts               # Score, ScoreFile 타입
│   │   ├── user.ts                # User, Profile 타입
│   │   ├── stats.ts               # Statistics 타입
│   │   ├── common.ts              # 공용 타입 (Error, Response 등)
│   │   └── database.ts            # Supabase 테이블 스키마 타입
│   │
│   ├── constants/                 # 설정 및 상수
│   │   ├── commission.ts          # 의뢰 상태, 카테고리 enum
│   │   ├── score.ts               # 악보 카테고리 enum
│   │   ├── ui.ts                  # UI 설정 (컬러, 크기 등)
│   │   ├── api.ts                 # API 엔드포인트 URL
│   │   ├── storage.ts             # 로컬 스토리지 키
│   │   └── validation.ts          # Zod 스키마 정의
│   │
│   ├── provider/                  # Context & Provider
│   │   ├── AuthProvider.tsx       # 인증 컨텍스트 (Supabase Auth)
│   │   ├── ThemeProvider.tsx      # 테마 컨텍스트 (Light/Dark)
│   │   └── (선택) AppProvider.tsx # 앱 전역 상태
│   │
│   ├── utils/                     # 유틸리티 함수
│   │   ├── query-client.ts        # QueryClient 설정
│   │   ├── supabase-client.ts     # Supabase 클라이언트 초기화
│   │   ├── date-utils.ts          # 날짜 포맷팅 (dayjs, date-fns)
│   │   ├── file-utils.ts          # 파일 다운로드, ZIP 생성 (jszip)
│   │   ├── format-utils.ts        # 숫자 포맷 (통화, 백분율)
│   │   ├── validation-utils.ts    # 입력값 검증
│   │   ├── error-handler.ts       # 에러 처리 로직
│   │   └── analytics.ts           # Vercel Analytics 래퍼
│   │
│   ├── lib/                       # 외부 라이브러리 통합
│   │   ├── supabase.ts            # Supabase 클라이언트 (환경변수 사용)
│   │   └── (선택) openai.ts       # OpenAI Vision API (AI 분석용)
│   │
│   ├── assets/                    # 정적 자산
│   │   ├── images/                # PNG, SVG, JPG
│   │   ├── icons/                 # 커스텀 아이콘 (SVG)
│   │   ├── fonts/                 # 웹폰트 (WOFF2)
│   │   └── sounds/                # 알림음 (MP3, WAV)
│   │
│   ├── styles/                    # 글로벌 CSS
│   │   ├── globals.css            # 전역 Tailwind 스타일
│   │   ├── animations.css         # 재사용 가능한 애니메이션
│   │   └── theme.css              # 테마 변수 (CSS Custom Properties)
│   │
│   ├── data/                      # 목 데이터 (개발용)
│   │   ├── commissions.ts         # 샘플 의뢰 데이터
│   │   └── scores.ts              # 샘플 악보 데이터
│   │
│   ├── mock/                      # MSW 목 핸들러
│   │   ├── handlers.ts            # HTTP 핸들러
│   │   └── server.ts              # MSW 서버 설정
│   │
│   ├── test/                      # 테스트 설정
│   │   ├── setup.ts               # Vitest 초기화
│   │   └── fixtures.ts            # 테스트 픽스처
│   │
│   ├── App.tsx                    # 루트 컴포넌트 (라우팅 정의)
│   ├── main.tsx                   # 엔트리 포인트
│   ├── index.css                  # 진입 스타일 (Tailwind import)
│   └── vite-env.d.ts              # Vite 타입 정의
│
├── supabase/                      # Supabase 설정 (백엔드)
│   ├── functions/                 # Edge Functions (서버리스)
│   │   ├── analyze-commission-image/    # AI 이미지 분석
│   │   ├── send-notification-email/    # 이메일 알림
│   │   └── push-reminder/               # 푸시 알림 리마인더
│   ├── migrations/                # DB 마이그레이션 SQL
│   ├── seed.sql                   # 초기 데이터 (샘플)
│   └── config.toml                # Supabase 클라이언트 설정
│
├── public/                        # 정적 파일 (HTTP 루트)
│   ├── index.html                 # HTML 진입점
│   ├── manifest.json              # PWA 매니페스트
│   ├── sw.js                      # Service Worker (PWA)
│   ├── robots.txt                 # SEO
│   ├── favicon.ico                # 파비콘
│   └── icons/                     # PWA 아이콘 (192px, 512px)
│
├── .moai/                         # MOAI 설정 (프로젝트 메타)
│   ├── config/                    # 설정 파일
│   ├── docs/                      # 추가 문서
│   ├── project/                   # 프로젝트 문서
│   │   ├── product.md             # 제품 사양
│   │   ├── structure.md           # 이 파일
│   │   └── tech.md                # 기술 스택
│   ├── specs/                     # SPEC 문서
│   └── reports/                   # 생성된 보고서
│
├── .claude/                       # Claude Code 설정
│   ├── CLAUDE.md                  # OMC 설정
│   ├── rules/                     # 코딩 규칙
│   └── agents/                    # 에이전트 프로필
│
├── .eslintrc.json                 # ESLint 설정
├── .prettierrc                    # Prettier 설정
├── eslint.config.js               # ESLint Flat Config
├── tsconfig.json                  # TypeScript 설정 (컴파일)
├── tsconfig.app.json              # TypeScript App 설정
├── tsconfig.node.json             # TypeScript Node 설정
├── vite.config.ts                 # Vite 빌드 설정
├── tailwind.config.ts             # Tailwind CSS 설정
├── postcss.config.cjs             # PostCSS 설정
├── .env.example                   # 환경변수 템플릿
├── .env.local                     # 환경변수 (실제, gitignore)
├── .env.development               # 개발 환경변수
├── .env.production                # 프로덕션 환경변수
│
├── package.json                   # 의존성 및 스크립트
├── package-lock.json              # 의존성 락 파일
├── .gitignore                     # Git 무시 파일
├── .husky/                        # Husky git hooks
├── .commitlintrc.json             # Commitlint 설정
├── vercel.json                    # Vercel 배포 설정
└── README.md                      # 프로젝트 가이드
```

## 각 디렉토리의 역할

### src/api/ - 데이터 페칭 레이어
**목적**: Supabase와의 모든 통신을 중앙화
**구성**: 도메인별 폴더 (commission, score, stats, auth, recommendation)
**패턴**:
- `queryKeys.ts`: React Query 캐시 키 정의 (`useQuery` 캐시 식별)
- `queries.ts`: `useQuery` 훅 (읽기 전용)
- `mutations.ts`: `useMutation` 훅 (생성/수정/삭제)
- `index.ts`: 배럴 export (사용: `import { useCommissions } from '@/api/commission'`)

**예시**: `commission/queries.ts`는 모든 의뢰 조회 쿼리를 포함 (목록, 상세, 필터 등)

### src/components/ - UI 컴포넌트 계층
**목적**: React 컴포넌트의 재사용 가능한 라이브러리
**구성**:
- `layout/`: AppLayout, Sidebar, Header, ProtectedRoute
- `pages/`: 페이지 수준 컴포넌트 (Pages 폴더의 컴포넌트화)
- `ui/`: shadcn/ui 프리셋 (Button, Dialog, Form 등)

**특징**: 데이터 페칭 로직 없음 (Props로만 데이터 받음)

### src/pages/ - 라우트 페이지
**목적**: React Router 라우트와 1:1 매핑
**특징**:
- Lazy-loaded (`React.lazy()`)
- 데이터 페칭 담당 (커스텀 훅 사용)
- 상태 관리, 폼 처리
- 페이지 레이아웃 정의

**예시**: `CommissionDetail.tsx`는 `useCommission(id)` 훅 사용 → API 호출 → 데이터를 component에 전달

### src/hooks/ - 커스텀 로직 계층
**목적**: 반복되는 로직 추상화
**유형**:
- **Data Fetching**: `useCommissions()`, `useScores()` (React Query 래퍼)
- **State Management**: `useAuth()`, `useTheme()` (Context + 로컬 상태)
- **Effects**: `usePush()`, `useLiveClock()` (사이드 이펙트)
- **Utilities**: `useMobile()`, `useSoundpostCheck()` (재사용 함수)

### src/types/ - TypeScript 타입
**목적**: 전체 프로젝트의 타입 안전성
**포함**:
- DB 스키마 타입 (Supabase auto-generated)
- 도메인 모델 (Commission, Score, Arrangement)
- API 응답 타입
- 폼 입력 타입 (React Hook Form)

### src/constants/ - 설정 및 Enum
**목적**: 매직 스트링 제거 및 설정 중앙화
**예**:
- `commission.ts`: `CommissionStatus = { RECEIVED: 'received', IN_PROGRESS: 'in_progress', ... }`
- `ui.ts`: `Colors.primary = '#3b82f6'`
- `api.ts`: `SOUNDPOST_API_URL = 'https://...'`

### src/provider/ - Context 프로바이더
**목적**: 전역 상태 관리
**현재**:
- `AuthProvider`: Supabase Auth 컨텍스트 (로그인 상태)
- `ThemeProvider`: next-themes (Light/Dark)

**미래**: 앱 전역 UI 상태 추가 가능 (Sidebar 오픈/클로즈 등)

### src/utils/ - 유틸리티 함수
**목적**: 일반 헬퍼 함수
**예**:
- `query-client.ts`: React Query 글로벌 설정
- `date-utils.ts`: dayjs 포맷팅
- `file-utils.ts`: ZIP 다운로드
- `error-handler.ts`: 에러 메시지 변환

### src/lib/ - 외부 라이브러리 래퍼
**목적**: 써드파티 SDK 초기화 및 설정
**현재**:
- `supabase.ts`: Supabase 클라이언트 (환경변수 주입)

## 주요 파일 위치

| 용도 | 파일 경로 |
|------|---------|
| 라우팅 정의 | `src/App.tsx` |
| 진입점 | `src/main.tsx` |
| QueryClient 설정 | `src/utils/query-client.ts` |
| Supabase 클라이언트 | `src/lib/supabase.ts` |
| 인증 로직 | `src/provider/AuthProvider.tsx` |
| 테마 설정 | `src/provider/ThemeProvider.tsx` |
| 글로벌 스타일 | `src/styles/globals.css` |
| Tailwind 설정 | `tailwind.config.ts` |
| TypeScript 설정 | `tsconfig.json` |
| Vite 설정 | `vite.config.ts` |
| 환경변수 | `.env.local` (gitignore) |
| PWA 설정 | `public/manifest.json`, `public/sw.js` |
| 에러 핸들링 | `src/components/ErrorBoundary.tsx` |
| 데이터 캐싱 | `src/api/[domain]/queryKeys.ts` |

## 모듈 조직 방식 (Module Organization)

### Domain-Driven API Organization
```
src/api/
├── commission/       # 의뢰 도메인
│   ├── index.ts      # export { useCreateCommission, useUpdateCommission, ... }
│   ├── queries.ts    # useCommissions, useCommission(id)
│   ├── mutations.ts  # useCreateCommission, useUpdateCommission, useDeleteCommission
│   └── queryKeys.ts  # commissionKeys = { all: [...], lists: [...], details: [...] }
├── score/           # 악보 도메인
├── stats/           # 통계 도메인
└── ...
```

**장점**:
- 각 도메인이 독립적 (의존성 최소)
- 함께 변경되는 파일들이 함께 위치
- 새로운 도메인 추가 시 폴더만 추가

### Component Hierarchy
```
src/components/
├── layout/          # 레이아웃 컴포넌트 (재사용)
├── pages/           # 페이지별 컴포넌트 (비즈니스 로직)
└── ui/              # 기초 UI 컴포넌트 (shadcn/ui)
```

**규칙**:
- `layout/`: 페이지 간 공유되는 상단 레이아웃
- `pages/commissions/`: CommissionList, CommissionForm, CommissionDetail 등
- `ui/`: 상태 없는 순수 UI 컴포넌트

### Page & Component 분리

**pages/ 폴더**:
- 라우팅 엔드포인트
- 데이터 페칭 로직
- 전체 페이지 레이아웃

**components/pages/ 폴더**:
- 페이지를 구성하는 부분 컴포넌트
- 상태 없는 프레젠테이션 컴포넌트
- 재사용 가능한 섹션

**예시**:
```
pages/CommissionList.tsx
├── useCommissions() 호출
├── <CommissionListHeader /> (components/pages/commissions/)
├── <CommissionTable /> (components/pages/commissions/)
└── <Pagination /> (components/ui/)
```

## 데이터 흐름 (Data Flow)

```
User Action (클릭, 폼 제출)
    ↓
pages/*.tsx (라우트 페이지)
    ↓
hooks/ (커스텀 훅, useQuery/useMutation)
    ↓
api/[domain]/ (React Query 설정)
    ↓
lib/supabase.ts (Supabase 클라이언트)
    ↓
Supabase Backend (PostgreSQL)
    ↓
API 응답 (JSON)
    ↓
React Query 캐시 (queryKeys 기준 저장)
    ↓
components/ (Props로 데이터 전달)
    ↓
UI 렌더링
```

## 유지보수 가이드

### 새로운 기능 추가
1. `src/types/[domain].ts` - 타입 정의
2. `src/constants/[domain].ts` - 상수/Enum 정의
3. `src/api/[domain]/` - 쿼리/뮤테이션 추가
4. `src/hooks/use-[feature].ts` - 커스텀 훅 작성 (선택)
5. `src/components/pages/[domain]/` - 컴포넌트 개발
6. `src/pages/[Feature].tsx` - 라우트 페이지 생성
7. `src/App.tsx` - 라우트 추가

### 기능 수정
1. `src/api/[domain]/` - 쿼리 수정
2. `src/components/pages/[domain]/` - UI 수정
3. `src/pages/[Feature].tsx` - 페이지 로직 수정
4. 테스트 실행 및 검증

### 버그 수정
1. 버그 위치 파악 (pages → components → hooks → api)
2. 해당 파일 수정
3. 에러 핸들링 추가 (선택)
4. 테스트 추가

## 레이어별 책임

| 레이어 | 파일 위치 | 책임 | 데이터 출처 |
|--------|---------|------|-----------|
| UI | `src/components/` | 렌더링, 이벤트 핸들러 | Props |
| Page | `src/pages/` | 데이터 페칭, 상태 관리 | Hooks |
| Hooks | `src/hooks/` | 데이터 및 상태 로직 | API 또는 Context |
| API | `src/api/[domain]/` | React Query 설정 | Supabase |
| Utils | `src/utils/` | 헬퍼 함수 | 입력 데이터 |
| Types | `src/types/` | 타입 정의 | TypeScript 타입 |
| Constants | `src/constants/` | 설정값 | 상수 정의 |

## 파일명 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase, .tsx | `CommissionList.tsx` |
| 페이지 | PascalCase, .tsx | `CommissionDetail.tsx` |
| 커스텀 훅 | camelCase, use-prefix, .ts | `use-auth.ts` |
| 유틸리티 | camelCase, -utils, .ts | `date-utils.ts` |
| 타입 | camelCase, .ts | `commission.ts` |
| 상수 | camelCase, .ts | `commission.ts` |
| 테스트 | 원본 파일명 + .test/.spec | `CommissionList.test.tsx` |
