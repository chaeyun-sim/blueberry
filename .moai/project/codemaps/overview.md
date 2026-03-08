# Blueberry 아키텍처 개요

## 프로젝트 소개

**Blueberry**는 프리랜서 음악 편곡자를 위한 의뢰/악보/매출 통합 관리 서비스입니다.

- **기술 스택**: React 18 + TypeScript + Supabase + TanStack Query + Vite
- **아키텍처 패턴**: Component-based UI + Domain-driven API
- **배포**: Vercel (Edge Functions, Analytics, Speed Insights)

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    브라우저 (PWA)                        │
│  src/main.tsx → React Root + Service Worker 등록        │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                   전역 프로바이더 (App.tsx)              │
│  - ErrorBoundary (L1/Global)                           │
│  - QueryClientProvider (staleTime: 5분, retry: 2회)   │
│  - ThemeProvider, AuthProvider, OverlayProvider       │
│  - BrowserRouter (React Router v6)                    │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
│  UI Layer    │  │ State Layer │  │ API Layer  │
│  Pages/Comps │  │ React Query │  │ src/api/   │
└──────────────┘  │ Context API │  └────────────┘
                  └─────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   데이터 소스 계층               │
        │  - Supabase PostgreSQL 데이터베이스  │
        │  - Supabase Storage (이미지/악보파일) │
        │  - Supabase Auth                │
        │  - Edge Functions (AI 분석 등)   │
        └────────────────────────────────┘
```

---

## 레이어 구조

### 1. UI Layer (`src/pages/`, `src/components/`)

**Pages (15개 라우트)**
- `Index.tsx` - 대시보드 (의뢰 요약, 월별 통계)
- `CommissionList.tsx` - 의뢰 목록 조회
- `CommissionRegister.tsx`, `CommissionDetail.tsx`, `CommissionEdit.tsx` - 의뢰 CRUD
- `ScoreList.tsx` - 악보 목록 (종합 곡/편성 관리)
- `ScoreRegister.tsx`, `ScoreDetail.tsx` - 악보/편성 CRUD
- `SalesStats.tsx` - 매출 통계 (차트, 분석)
- `CalendarView.tsx` - 달력 뷰 (의뢰 마감일)
- `MusicRecommend.tsx` - 일일 음악 추천 + Soundpost 연동
- `Login.tsx` - Supabase 인증
- `Settings.tsx` - 사용자 설정
- `ExcelUploadDetail.tsx` - Excel 매출 데이터 상세 조회
- `NotFound.tsx` - 404

**컴포넌트 그룹**
- `src/components/ui/` - shadcn/ui 프리미티브 (Button, Dialog, Input 등)
- `src/components/pages/` - 도메인별 페이지 컴포넌트
  - `commission/` - CommissionRegisterForm, AnalyzeImage, StatusBadge 등
  - `score/` - ScoreRegisterForm, FileEntryList, ZipUploadCard 등
  - `sales/` - SalesAll, YearlyStats, TopSongBar, 차트 컴포넌트들
  - `dashboard/` - CommissionSummaryBar, RevenueSliderCard, MonthlyChart
  - `recommend/` - RecommendCard, SidePanel, SoundpostLinks
- `src/components/register-form-items/` - 폼 입력 필드 (곡명, 작곡가, 악보 버전 등)

**Layout & Guards**
- `AppLayout.tsx` - 메인 레이아웃 (헤더, 사이드바)
- `ProtectedRoute.tsx` - 인증 보호 라우트

---

### 2. State Management Layer

**React Query** (서버 상태)
- QueryClient 설정: staleTime=5분, gcTime=10분, retry=2회
- Domain별 쿼리 키 팩토리 (`src/api/*/queryKeys.ts`)
- useQuery + useMutation 기반 데이터 페칭

**Context API** (클라이언트 상태)
- `AuthContext` - 세션, 게스트 모드
- `ThemeContext` - 다크/라이트 모드

**상태 패턴**
- 폼: React Hook Form + Zod validation
- 로딩/에러: isLoading, isError, isPending 상태 추적
- 낙관적 업데이트: mutation 성공 시 캐시 즉시 업데이트

---

### 3. API Layer (`src/api/`)

**Domain 구조** (각 도메인 폴더별 index.ts, queries.ts, mutations.ts, queryKeys.ts)

#### Commission (의뢰)
- `getCommissions()` - 목록 조회 (마감일순)
- `getCommission(id)` - 상세 조회
- `createCommission()` - 신규 등록
- `updateCommission()`, `deleteCommission()` - 수정/삭제
- `updateCommissionStatus()` - 상태 변경 (접수→진행중→완료)
- `analyzeCommissionImage()` - Supabase Edge Function 호출 (AI 분석)
- `uploadCommissionImage()` - Storage 업로드
- `getMonthlyCommissionCounts()` - 월별 접수 건수

#### Score (악보/편성)
- `getSongs()` - 곡 목록 (soft delete 제외)
- `getSong(id)` - 곡 상세 조회
- `getArrangement(arrangementId)` - 편성 상세 조회 (파일 포함)
- `createSong()` - 곡 등록 (곡명/작곡가 중복 처리)
- `updateSong()` - 곡 정보 수정
- `deleteSong()` - 곡 soft delete
- `createArrangement()` - 편성 등록
- `deleteArrangement()` - 편성 soft delete
- `uploadArrangementFile()`, `createArrangementFile()` - 악보 파일 업로드
- `deleteArrangementFile()` - 악보 파일 삭제 (hard delete)

#### Stats (매출)
- `getSalesSummary()` - 4개 요약 카드 (올해/작년/지난달/전월 비교)
- `getMonthlySales(year)` - 월별 매출 추이
- `getMonthlyCategoryBreakdown(year)` - 월별 카테고리 분포
- `getCategoryDistribution()` - 카테고리별 매출 비율
- `getTopSongs()` - 인기곡 TOP N
- `getTopArrangements()` - 인기 편성 TOP N
- `getTopSongMonthlySales()` - 인기곡 월별 판매 추이
- `getSalesYearRange()` - 판매 데이터 연도 범위
- `getSalesRows()` - 전체 판매 행 조회 (SalesAll 테이블용)
- `saveSalesRows()` - Excel 데이터 저장 (500행 청크 단위)
- `getExcelUploads()` - 업로드 목록
- `deleteExcelUpload()` - 업로드 삭제 (CASCADE)

#### Recommendation (음악 추천)
- `getTodayRecommendation()` - 오늘의 추천곡 (KST 기준)
- `getRecentRecommendations(limit)` - 최근 추천곡
- `getAllRecommendations()` - 전체 추천곡 (사이드패널 검색용)
- `getWorkedSongIds()` - 작업 완료한 추천곡 ID 목록
- `markAsWorked()`, `unmarkAsWorked()` - 작업 완료 표시/취소

#### Auth (인증)
- `login(email, password)` - 로그인
- `logout()` - 로그아웃
- `getSession()` - 현재 세션 조회
- `onAuthStateChange()` - 인증 상태 변화 감지

---

### 4. 백엔드 & 외부 통합

**Supabase PostgreSQL**
- Tables: commissions, songs, arrangements, arrangement_files, sales, excel_uploads, recommendations, worked_songs
- Soft delete 패턴: deleted_at 컬럼 사용
- Foreign Keys: 의뢰↔곡, 곡↔편성, 편성↔파일, 판매↔곡/편성, 판매↔업로드

**Supabase Storage**
- `commission-images/` - 의뢰 이미지
- `arrangement-files/` - 악보 파일 (ZIP, PDF 등)

**Supabase Edge Functions** (Node.js)
- `analyze-commission` - 의뢰 이미지 AI 분석 (Claude API)
- `send-score-email` - 악보 등록 알림
- `send-push` - Web Push 알림
- `generate-recommendation` - 일일 추천곡 생성 (Scheduler)
- `check-deadlines` - 마감일 알림

**외부 서비스**
- **Soundpost API** - 음악 레퍼런스 검색 (vite.config.ts 프록시)
- **Vercel** - 배포, Analytics, Speed Insights
- **Web Push API** - 마감일 알림 구독

---

## 설계 패턴

### 쿼리 키 팩토리 (Query Keys)
```typescript
// src/api/commission/queryKeys.ts
export const commissionKeys = {
  all: ['commissions'] as const,
  list: () => [...commissionKeys.all, 'list'] as const,
  detail: (id: string) => [...commissionKeys.all, 'detail', id] as const,
  monthlyCounts: () => [...commissionKeys.all, 'monthlyCounts'] as const,
}
```
=> Pages에서 `useQuery(commissionKeys.detail(id))` 형태로 사용

### Soft Delete 패턴
```typescript
// 조회: deleted_at IS NULL
const { data } = await supabase
  .from('songs')
  .select()
  .is('deleted_at', null)

// 삭제: 행 제거 대신 timestamp 기록
await supabase
  .from('songs')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', id)
```

### Error Boundary 계층 구조 (L1, L2, L3)
- **L1 (Global)**: App.tsx의 ErrorBoundary - 렌더링 에러 캐치, 스택 트레이스 로깅
- **L2 (Page)**: 각 Page 컴포넌트 - 페이지별 에러 격리, 폴백 UI
- **L3 (Section)**: Dashboard 섹션 - 의뢰/통계 섹션별 독립 처리

### 폼 검증
- React Hook Form + Zod
- 예: `RegisterFormSongTitle.tsx` - 곡명 검색/선택, 중복 확인

### 지연 로딩 (Lazy Loading)
```typescript
const Index = lazy(() => import("./pages/Index"));
// App.tsx의 <Suspense>로 감싼 라우트
```

---

## 주요 데이터 흐름

### 의뢰 생성
1. CommissionRegister.tsx 페이지 진입
2. CommissionRegisterForm 렌더링 (React Hook Form)
3. 폼 제출 → createCommission 뮤테이션 호출
4. Supabase 저장 → Storage에 이미지 업로드
5. 선택: analyzeCommissionImage() Edge Function 호출 (AI)
6. 성공 시 캐시 업데이트 → CommissionList 자동 갱신

### 악보 조회 및 파일 관리
1. ScoreDetail.tsx 진입 (scoreId, arrangementId)
2. getArrangement() - 편성 상세 조회 (파일 목록 포함)
3. FileEntryList 렌더링 - 각 파일 다운로드/삭제 가능
4. 파일 삭제 시 Storage + DB 동시 삭제 (hard delete)

### 매출 통계
1. SalesStats.tsx 진입
2. 병렬 쿼리 발행:
   - getSalesSummary() - 4개 요약 카드
   - getMonthlySales(year) - 월별 추이 차트
   - getCategoryDistribution() - 카테고리 파이차트
   - getTopSongs() - 인기곡 막대 차트
3. 각 쿼리 결과 → 차트 컴포넌트에 props 전달

### Excel 매출 데이터 임포트
1. ExcelTab 컴포넌트 - 파일 선택 (xlsx)
2. parseExcelFile() - 클라이언트 파싱
3. saveSalesRows(rows, uploadName) - Supabase 저장
   - excel_uploads 레코드 생성
   - songs/arrangements 룩업 테이블 병렬 조회
   - product 문자열 파싱 후 ID 매핑
   - 500행 청크로 split insert
4. 성공 시 StatsTab 갱신

---

## 성능 최적화 전략

| 항목 | 방법 | 효과 |
|------|------|------|
| **쿼리 캐싱** | staleTime=5분 | 재페칭 50-70% 감소 |
| **Select 절 최소화** | 필요한 컬럼만 select | 데이터 전송량 60% 감소 |
| **지연 로딩** | React.lazy() + Suspense | 초기 번들 10-15% 감소 |
| **청크 insert** | 500행 단위 split | Excel 대용량 업로드 안정화 |
| **병렬 쿼리** | Promise.all() | 통계 조회 응답시간 개선 |
| **낙관적 업데이트** | mutation 즉시 반영 | UI 반응성 향상 |

---

## 보안

- **Supabase Row Level Security** - user_id 기반 테이블 접근 제어
- **CORS & CSRF** - Supabase 기본 설정 + Vite 프록시
- **입력 검증** - Zod schema (폼 + API 응답)
- **파일 업로드** - 확장자/크기 검증 (ALLOWED_EXTENSIONS, MAX_FILE_SIZE)
- **민감한 데이터** - .env.local (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

---

## 배포 & 모니터링

- **Vercel** - 자동 배포 (Git 푸시)
- **Analytics** - Vercel Analytics (성능 추적)
- **Speed Insights** - 웹 바이탈 모니터링 (LCP, FID, CLS)
- **PWA** - Service Worker 자동 등록 (src/main.tsx)
- **Error Logging** - ErrorBoundary + console.error
