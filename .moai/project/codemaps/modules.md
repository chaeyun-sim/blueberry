# Blueberry 모듈 맵

## 모듈 일람

| 모듈 | 경로 | 책임 | 주요 파일 |
|------|------|------|----------|
| **Commission** | `src/api/commission/` | 의뢰 CRUD, 상태관리, AI 이미지 분석 | queries.ts, mutations.ts |
| **Score** | `src/api/score/` | 곡/편성 관리, 파일 업로드, soft delete | queries.ts, mutations.ts |
| **Stats** | `src/api/stats/` | 매출 통계, Excel 임포트, 카테고리 분석 | queries.ts, mutations.ts |
| **Recommendation** | `src/api/recommendation/` | 일일 추천곡, 작업 완료 추적 | queries.ts |
| **Auth** | `src/api/auth/` | 로그인, 로그아웃, 세션 관리 | index.ts |
| **UI Primitives** | `src/components/ui/` | shadcn/ui 기반 재사용 컴포넌트 | *.tsx (40+개) |

---

## Commission 모듈

### 책임
- 의뢰 정보 CRUD (Create, Read, Update, Delete)
- 의뢰 상태 변경 (접수 → 진행중 → 완료 → 보류)
- 의뢰 이미지 업로드 & AI 분석
- 월별 의뢰 접수 건수 통계

### 공개 인터페이스

**Queries** (`src/api/commission/index.ts`)
```typescript
getCommissions(): Promise<Commission[]>
getCommission(id: string): Promise<Commission>
getMonthlyCommissionCounts(): Promise<{ month: string; count: number }[]>
```

**Mutations** (`src/api/commission/mutations.ts`)
```typescript
useCreateCommission()
useUpdateCommission()
useDeleteCommission()
useUpdateCommissionStatus()
useUploadCommissionImage()
useAnalyzeCommissionImage()
```

**Query Keys** (`src/api/commission/queryKeys.ts`)
```typescript
commissionKeys.all         // ['commissions']
commissionKeys.list()      // ['commissions', 'list']
commissionKeys.detail(id)  // ['commissions', 'detail', id]
commissionKeys.monthlyCounts()
```

### 주요 파일
- **index.ts** (137줄) - 조회 함수 (getCommissions, getCommission, getMonthlyCommissionCounts)
- **queryKeys.ts** (6줄) - 쿼리 키 팩토리
- **mutations.ts** - 뮤테이션 정의 (상태 변경, 이미지 업로드)

### 의존성
- `src/lib/supabase.ts` - Supabase 클라이언트
- `src/types/commission` - Commission, CreateCommissionInput 타입
- `src/constants/status-config` - CommissionStatus enum
- Supabase Edge Function: `analyze-commission` (AI)

### 사용처
- `CommissionList.tsx` - 의뢰 목록 표시
- `CommissionDetail.tsx` - 의뢰 상세 조회 & 상태 변경
- `Index.tsx` - 대시보드 의뢰 요약 카드
- `CalendarView.tsx` - 의뢰 마감일 달력

---

## Score 모듈

### 책임
- 곡 (Song) 정보 CRUD
- 편성 (Arrangement) 정보 CRUD
- 악보 파일 (ZIP, PDF 등) 업로드 & 관리
- Soft delete 패턴 구현 (deleted_at 컬럼)
- 곡명+작곡가 중복 확인

### 공개 인터페이스

**Queries** (`src/api/score/index.ts`)
```typescript
getSongs(): Promise<Song[]>
getSong(id: string): Promise<Song>
getArrangement(arrangementId: string): Promise<Arrangement>
findSongByTitle(title: string, composer: string): Promise<Pick<Song, 'id' | 'title' | 'composer'> | null>
```

**Mutations** (`src/api/score/mutations.ts`)
```typescript
useCreateSong()
useUpdateSong()
useDeleteSong()
useCreateArrangement()
useDeleteArrangement()
useUploadArrangementFile()
useDeleteArrangementFile()
```

**Query Keys** (`src/api/score/queryKeys.ts`)
```typescript
scoreKeys.all                      // ['scores']
scoreKeys.list()                   // ['scores', 'list']
scoreKeys.detail(id)               // ['scores', 'detail', id]
scoreKeys.arrangement(id)          // ['scores', 'arrangement', id]
```

### 주요 파일
- **index.ts** (209줄) - 곡/편성 조회, CRUD, 파일 관리
  - `findSongByTitle()` - 곡명+작곡가로 검색 (upsert 용)
  - `getSongs()`, `getSong()` - soft delete 제외
  - `getArrangement()` - 편성+파일 조회
  - `uploadArrangementFile()` - Storage 업로드 + URL 반환
  - `deleteArrangementFile()` - Storage + DB 동시 삭제 (hard delete)
- **queryKeys.ts** (6줄)

### 의존성
- `src/lib/supabase.ts` - Supabase 클라이언트
- `src/types/score` - Song, Arrangement, ArrangementFile 타입
- `src/constants/file-types` - ALLOWED_EXTENSIONS, MAX_FILE_SIZE

### 사용처
- `ScoreList.tsx` - 곡 목록 조회
- `ScoreDetail.tsx` - 편성 상세 조회 & 파일 관리
- `ScoreRegister.tsx` - 곡/편성 신규 등록
- `ScoreRegisterForm.tsx` - 폼 입력
- `CommissionRegisterForm.tsx` - 의뢰에 곡 선택

---

## Stats 모듈

### 책임
- 매출 요약 통계 (올해, 지난달 vs 전년/전월 비교)
- 월별/카테고리별 매출 분포
- 인기곡/편성 분석
- Excel 매출 데이터 임포트 & 저장
- 업로드 관리 (목록, 삭제)

### 공개 인터페이스

**Queries** (`src/api/stats/index.ts`)
```typescript
getSalesSummary(): Promise<SalesSummary>
getMonthlySales(year: number): Promise<MonthlySale[]>
getMonthlyCategoryBreakdown(year: number): Promise<MonthlyCategoryData[]>
getCategoryDistribution(year?: number): Promise<CategoryDistributionItem[]>
getTopSongs(topN = 5): Promise<TopSong[]>
getTopArrangements(topN = 5): Promise<TopArrangement[]>
getTopSongMonthlySales(year: number, topN = 5): Promise<TopSongMonthlySalesResult>
getSalesYearRange(): Promise<{ min: number; max: number } | null>
getSalesRows(year?: number): Promise<ExcelRow[]>
getExcelUploads(): Promise<ExcelUpload[]>
getSalesRowsByUploadId(uploadId: string): Promise<ExcelRow[]>
```

**Mutations** (`src/api/stats/mutations.ts`)
```typescript
useSaveSalesRows()
useDeleteExcelUpload()
```

**Query Keys** (`src/api/stats/queryKeys.ts`)
```typescript
statsKeys.all                              // ['stats']
statsKeys.salesSummary()                   // ['stats', 'salesSummary']
statsKeys.monthlySales(year)               // ['stats', 'monthlySales', year]
statsKeys.categoryDistribution()
statsKeys.topSongs()
statsKeys.excelUploads()
statsKeys.salesRowsByUploadId(uploadId)
```

### 주요 파일
- **index.ts** (566줄) - 통계 조회 & Excel 처리
  - `getSalesSummary()` - 4개 요약 카드용 5개 병렬 쿼리
  - `getMonthlySales()` - 월별 매출 + 전년도 비교
  - `getCategoryDistribution()` - 카테고리별 비율 & 건수
  - `getTopSongs()`, `getTopArrangements()` - 순위 분석
  - `saveSalesRows()` - Excel 데이터 저장 (곡/편성 ID 매핑, 500행 청크)
- **queryKeys.ts** (13줄)

### 의존성
- `src/lib/supabase.ts`
- `src/types/stats` - SalesSummary, MonthlySale 등
- `src/types/excel` - ExcelRow
- `src/utils/split-product` - product 문자열 파싱 (곡명-편성)
- `src/constants/month` - 월명 상수

### 사용처
- `SalesStats.tsx` - 매출 통계 페이지
- `SalesAll.tsx` - 판매 행 테이블
- `YearlyStats.tsx` - 월별 추이, 카테고리 분포 차트
- `Stats.tsx` - 인기곡/편성, 카테고리 파이차트
- `ExcelUploadDetail.tsx` - 업로드 내역 상세 조회
- `ExcelUploadDialog.tsx` - 파일 선택 & 저장

---

## Recommendation 모듈

### 책임
- 일일 음악 추천곡 조회
- 추천곡 기반 작업 완료 추적
- Soundpost API 연동 (음악 레퍼런스 검색)

### 공개 인터페이스

**Queries** (`src/api/recommendation/index.ts`)
```typescript
getTodayRecommendation(): Promise<MusicRecommendation | null>
getRecentRecommendations(limit: number): Promise<{ date: string; rec: MusicRecommendation }[]>
getAllRecommendations(): Promise<MusicRecommendation[]>
getWorkedSongIds(): Promise<Set<string>>
```

**Mutations** (`src/api/recommendation/index.ts`)
```typescript
markAsWorked(recommendationId: string): Promise<void>
unmarkAsWorked(recommendationId: string): Promise<void>
```

**Query Keys** (`src/api/recommendation/queryKeys.ts`)
```typescript
recommendationKeys.today()
recommendationKeys.recent()
recommendationKeys.all()
recommendationKeys.workedSongIds()
```

### 주요 파일
- **index.ts** (105줄) - 추천곡 조회 & 작업 추적
  - `getTodayRecommendation()` - KST 기준 오늘 추천곡 1개
  - `getWorkedSongIds()` - 사용자별 작업 완료한 추천곡 ID Set
  - `markAsWorked()`, `unmarkAsWorked()` - 작업 상태 토글
- **queryKeys.ts** (4줄)

### 의존성
- `src/lib/supabase.ts`
- `src/mock/recommendations` - MusicRecommendation 타입

### 사용처
- `MusicRecommend.tsx` - 추천곡 카드 & 사이드패널 (검색, 작업 완료 토글)
- `RecommendCard.tsx` - 개별 추천곡 표시
- `SidePanel.tsx` - 최근 추천곡 검색

---

## Auth 모듈

### 책임
- Supabase 기반 이메일/비밀번호 인증
- 세션 관리
- 게스트 모드 (sessionStorage)

### 공개 인터페이스

```typescript
login(email: string, password: string): Promise<AuthResponse>
logout(): Promise<void>
getSession(): Promise<Session | null>
onAuthStateChange(callback): Unsubscribe
```

### 주요 파일
- **index.ts** (31줄) - 인증 API 함수

### 의존성
- `src/lib/supabase.ts` - Supabase 클라이언트

### 사용처
- `AuthProvider.tsx` - 인증 상태 관리
- `Login.tsx` - 로그인 폼
- `ProtectedRoute.tsx` - 인증 보호 라우트

---

## UI Primitives 모듈

### 책임
- shadcn/ui 기반 공통 UI 컴포넌트 제공
- 스타일 일관성 유지 (Tailwind CSS)
- 접근성 준수 (ARIA)

### 주요 컴포넌트

| 컴포넌트 | 용도 |
|---------|------|
| **Button** | 클릭 액션 |
| **Dialog** | 모달 다이얼로그 |
| **Input** | 텍스트 입력 |
| **Select** | 드롭다운 선택 |
| **Table** | 데이터 표 |
| **Tabs** | 탭 네비게이션 |
| **Toast** | 알림 메시지 (Sonner) |
| **Drawer** | 사이드 슬라이드 |
| **Dropdown-Menu** | 컨텍스트 메뉴 |
| **Form** | React Hook Form 통합 |
| **Label** | 폼 라벨 |
| **Checkbox**, **Radio** | 선택 입력 |
| **Calendar** | 날짜 선택 |
| **Command** | 커맨드 팔레트 (Autocomplete용) |
| **Chart** | Recharts 래퍼 |

### 경로
`src/components/ui/*.tsx` (40+ 파일)

### 의존성
- shadcn/ui (Radix UI + Tailwind CSS)
- Recharts (차트)
- Sonner (Toast)

---

## Pages 레이어

### 대시보드 & 의뢰
- **Index.tsx** - 홈/대시보드 (의뢰 요약, 월별 통계)
- **CommissionList.tsx** - 의뢰 목록
- **CommissionRegister.tsx** - 의뢰 신규 등록
- **CommissionDetail.tsx** - 의뢰 상세 & 상태 변경
- **CommissionEdit.tsx** - 의뢰 정보 수정

### 악보 & 파일
- **ScoreList.tsx** - 악보 목록 (곡+편성)
- **ScoreRegister.tsx** - 악보 신규 등록
- **ScoreDetail.tsx** - 편성 상세 & 파일 관리
- **Files.tsx** - 모든 파일 조회 (폴더/ZIP 구조)

### 매출 & 분석
- **SalesStats.tsx** - 매출 통계 대시보드
- **ExcelUploadDetail.tsx** - Excel 업로드 내역 조회

### 추가
- **CalendarView.tsx** - 의뢰 마감일 달력
- **MusicRecommend.tsx** - 일일 음악 추천
- **Settings.tsx** - 사용자 설정
- **Login.tsx** - 로그인
- **NotFound.tsx** - 404

---

## 컴포넌트 상세

### Commission 컴포넌트
- `CommissionRegisterForm.tsx` - 의뢰 등록 폼 (RHF + Zod)
- `CompleteDialog.tsx` - 의뢰 완료 다이얼로그
- `DeleteCommissionDialog.tsx` - 의뢰 삭제 확인
- `ReceiveAndSendDialog.tsx` - 의뢰 상태 변경
- `AnalyzeImage.tsx` - AI 이미지 분석 (Edge Function 호출)
- `CommissionImageDialog.tsx` - 이미지 미리보기
- `StatusBadge.tsx` - 상태 배지 (색상 표시)
- `ReadOnlyFileList.tsx` - 업로드 파일 읽기용
- `ZipFileHeader.tsx` - ZIP 파일 해더
- `Dropzone.tsx` - 파일 드래그 앤 드롭

### Score 컴포넌트
- `ScoreRegisterForm.tsx` - 곡/편성 등록 폼
- `FileEntryList.tsx` - 편성 파일 목록
- `FileTypeSummary.tsx` - 파일 타입 요약
- `ZipUploadCard.tsx` - ZIP 업로드 카드
- `DeleteArrangementDialog.tsx` - 편성 삭제 확인
- `DeleteSongDialog.tsx` - 곡 삭제 확인

### Sales 컴포넌트
- `SalesAll.tsx` - 판매 행 테이블
- `YearlyStats.tsx` - 월별 추이 & 카테고리 분포
- `Stats.tsx` - 통계 차트들 (파이, 레이더, 막대)
- `SalesAll.tsx` - 전체 판매 행 (페이지네이션)
- `SalesSummaryCard.tsx` - 4개 요약 카드
- `charts/*.tsx` - Recharts 기반 차트

### Recommend 컴포넌트
- `RecommendCard.tsx` - 개별 추천곡 카드
- `SidePanel.tsx` - 최근 추천곡 & 검색
- `SoundpostLinks.tsx` - Soundpost 음악 링크
- `SoundpostBadge.tsx` - Soundpost 연동 배지

### Dashboard 컴포넌트
- `CommissionSummaryBar.tsx` - 의뢰 요약 (상태별 건수)
- `MonthlyChart.tsx` - 월별 의뢰 접수 추이
- `RevenueSliderCard.tsx` - 매출 슬라이더 카드
- `RollingNumber.tsx` - 애니메이션 숫자

### Register Form Items
- `RegisterFormLayout.tsx` - 폼 레이아웃
- `RegisterFormSongTitle.tsx` - 곡명 검색/선택
- `RegisterFormComposer.tsx` - 작곡가 입력
- `RegisterFormVersion.tsx` - 악보 버전 선택
- `InstrumentPicker.tsx` - 악기 선택

### Layout & Core
- `AppLayout.tsx` - 메인 레이아웃 (헤더, 사이드바)
- `ProtectedRoute.tsx` - 인증 보호 라우트
- `ErrorBoundary.tsx` - 에러 경계 (L1 Global)
- `Autocomplete.tsx` - 자동완성 입력
- `ExcelUploadDialog.tsx` - Excel 파일 선택
