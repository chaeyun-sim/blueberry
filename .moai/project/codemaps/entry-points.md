# Blueberry 진입점 및 라우팅 맵

## 애플리케이션 진입점

### 1. 브라우저 진입점

**`src/main.tsx`** (12줄)
```typescript
// React 루트 마운팅
createRoot(document.getElementById("root")!).render(<App />);

// PWA Service Worker 등록
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  });
}
```

**역할**
- React 앱 초기화
- Service Worker 등록 (PWA 오프라인 지원)
- 진입점은 `public/index.html`의 `<div id="root">`

---

### 2. 애플리케이션 루트

**`src/App.tsx`** (82줄)

```typescript
<ErrorBoundary level="global">
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OverlayProvider>
              <Suspense>
                <Routes>
                  {/* 라우트 정의 */}
                </Routes>
              </Suspense>
            </OverlayProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
</ErrorBoundary>
```

**역할**
- 전역 에러 바운더리 (L1 Global)
- React Query 클라이언트 제공
- 테마/인증/알림 프로바이더 설정
- 라우트 정의

---

### 3. QueryClient 초기화

**`src/utils/query-client.ts`** (17줄)
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,           // 5분
      gcTime: 1000 * 60 * 10,             // 10분
      retry: 2,
      retryDelay: Math.min(2^n * 1000ms, 30s)
    },
    mutations: {
      retry: 0  // 변경은 재시도 금지
    }
  }
})
```

**역할**
- React Query 전역 설정
- 캐시 타임아웃, 재시도 정책

---

### 4. Supabase 클라이언트

**`src/lib/supabase.ts`** (10줄)
```typescript
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**역할**
- Supabase 싱글톤 클라이언트
- 모든 API 모듈에서 임포트되어 사용

---

## 라우팅 구조

### 라우트 정의 (App.tsx)

```
/ (로그인 보호 안 함)
├─ /login → Login.tsx
│  └─ 게스트 모드 진입 가능
│
└─ /* (ProtectedRoute로 보호)
   ├─ / → Index.tsx (대시보드)
   ├─ /commissions → CommissionList.tsx
   ├─ /new → CommissionRegister.tsx
   ├─ /commissions/:id → CommissionDetail.tsx
   ├─ /commissions/:id/edit → CommissionEdit.tsx
   ├─ /files → Files.tsx
   ├─ /scores/:scoreId/arrangements/:arrangementId → ScoreDetail.tsx
   ├─ /scores/new → ScoreRegister.tsx
   ├─ /stats → SalesStats.tsx
   ├─ /calendar → CalendarView.tsx
   ├─ /recommend → MusicRecommend.tsx
   ├─ /settings → Settings.tsx
   ├─ /files/excel/:uploadId → ExcelUploadDetail.tsx
   │
   └─ * → NotFound.tsx (404)
```

---

## 인증 및 보호

### ProtectedRoute 컴포넌트

**`src/components/layout/ProtectedRoute.tsx`**
```typescript
function ProtectedRoute({ children }) {
  const { session, loading, isGuest } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!session && !isGuest) return <Navigate to="/login" />;

  return children;
}
```

**보호 대상**
- 모든 라우트 except `/login`
- 세션 또는 게스트 모드 필요

### AuthProvider

**`src/provider/AuthProvider.tsx`** (45줄)
```typescript
function AuthProvider({ children }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    getSession().then(setSession).finally(() => setLoading(false));
    onAuthStateChange(setSession);
  }, []);

  const enterGuestMode = () => {
    sessionStorage.setItem('guest_mode', 'true');
    setIsGuest(true);
  };

  const exitGuestMode = async () => {
    sessionStorage.removeItem('guest_mode');
    setIsGuest(false);
    await logout();
  };

  return (
    <AuthContext.Provider value={{ session, loading, isGuest, enterGuestMode, exitGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**역할**
- 세션 상태 관리
- 게스트 모드 토글
- 로딩 상태 추적

---

## 지연 로딩 (Lazy Loading) 맵

### 동적 임포트 (React.lazy)

**`src/App.tsx`**
```typescript
const Index = lazy(() => import("./pages/Index"));
const CommissionList = lazy(() => import("./pages/CommissionList"));
const CommissionRegister = lazy(() => import("./pages/CommissionRegister"));
const CommissionDetail = lazy(() => import("./pages/CommissionDetail"));
const CommissionEdit = lazy(() => import("./pages/CommissionEdit"));
const Files = lazy(() => import("./pages/Files"));
const ScoreDetail = lazy(() => import("./pages/ScoreDetail"));
const ScoreRegister = lazy(() => import("./pages/ScoreRegister"));
const SalesStats = lazy(() => import("./pages/SalesStats"));
const CalendarView = lazy(() => import("./pages/CalendarView"));
const MusicRecommend = lazy(() => import("./pages/MusicRecommend"));
const Login = lazy(() => import("./pages/Login"));
const Settings = lazy(() => import("./pages/Settings"));
const ExcelUploadDetail = lazy(() => import("./pages/ExcelUploadDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
```

**장점**
- 초기 번들 크기 감소 (10-15%)
- 라우트 이동 시에만 로드

**Suspense 폴백**
```typescript
<Suspense>
  <Routes>
    {/* 페이지 로드 중 폴백 UI 표시 */}
  </Routes>
</Suspense>
```

---

## 페이지별 데이터 로딩 흐름

### 1. Index.tsx (대시보드)

```
Index (useQuery)
├─ getCommissions() → commissionKeys.list
│  └─ CommissionSummaryBar (의뢰 요약)
├─ getSalesSummary() → statsKeys.salesSummary
│  └─ SalesCards (4개 요약 카드)
├─ getMonthlyCommissionCounts() → commissionKeys.monthlyCounts
│  └─ MonthlyChart (월별 의뢰 추이)
└─ ErrorBoundary (L2) - 데이터 로드 실패 시 폴백
```

### 2. CommissionList.tsx

```
CommissionList (useQuery)
├─ getCommissions()
│  └─ 의뢰 테이블 렌더링
│     ├─ 각 행: 상태, 곡명, 작곡가, 마감일
│     └─ 액션: 수정, 상세 조회, 삭제
└─ ErrorBoundary (L2)
```

### 3. CommissionDetail.tsx

```
CommissionDetail (useQuery + useMutation)
├─ getCommission(id) → commissionKeys.detail(id)
│  └─ 의뢰 상세 정보 표시
├─ updateCommissionStatus() 뮤테이션
│  └─ ReceiveAndSendDialog (상태 변경)
├─ uploadCommissionImage() 뮤테이션
│  └─ 이미지 업로드
├─ analyzeCommissionImage() 뮤테이션
│  └─ Edge Function 호출 (AI 분석)
└─ ErrorBoundary (L2)
```

### 4. ScoreDetail.tsx

```
ScoreDetail (useQuery + useMutation)
├─ getArrangement(arrangementId) → scoreKeys.arrangement(id)
│  └─ 편성 정보 + 파일 목록
├─ uploadArrangementFile() 뮤테이션
│  └─ 파일 업로드 (Storage)
├─ deleteArrangementFile() 뮤테이션
│  └─ 파일 삭제 (Storage + DB)
└─ ErrorBoundary (L2)
```

### 5. SalesStats.tsx

```
SalesStats (병렬 useQuery x 8)
├─ getSalesSummary() → statsKeys.salesSummary
│  └─ SalesCards (4개 요약)
├─ getMonthlySales(year) → statsKeys.monthlySales(year)
│  └─ MonthlyGrowthRateChart
├─ getMonthlyCategoryBreakdown(year) → statsKeys.monthlyCategoryBreakdown(year)
│  └─ CategoryGrowthRateChart
├─ getCategoryDistribution() → statsKeys.categoryDistribution
│  └─ Stats (파이차트)
├─ getTopSongs() → statsKeys.topSongs
│  └─ TopSongBar (막대 차트)
├─ getTopArrangements() → statsKeys.topArrangements
│  └─ Stats (레이더 차트)
├─ getTopSongMonthlySales(year) → statsKeys.topSongMonthlySales(year)
│  └─ Stats (라인 차트)
├─ getSalesYearRange() → statsKeys.salesYearRange
│  └─ 연도 드롭다운
├─ getSalesRows(year) → statsKeys.salesRows(year)
│  └─ SalesAll (판매 행 테이블)
└─ ErrorBoundary (L2)
```

### 6. ExcelUploadDetail.tsx

```
ExcelUploadDetail (useQuery)
├─ getSalesRowsByUploadId(uploadId) → statsKeys.salesRowsByUploadId(uploadId)
│  └─ 업로드 행 테이블
├─ deleteExcelUpload() 뮤테이션
│  └─ 업로드 삭제
└─ ErrorBoundary (L2)
```

### 7. MusicRecommend.tsx

```
MusicRecommend (병렬 useQuery x 4)
├─ getTodayRecommendation() → recommendationKeys.today
│  └─ RecommendCard (오늘의 추천곡)
├─ getRecentRecommendations(30) → recommendationKeys.recent
│  └─ 최근 추천곡 목록
├─ getAllRecommendations() → recommendationKeys.all
│  └─ SidePanel (검색용)
├─ getWorkedSongIds() → recommendationKeys.workedSongIds
│  └─ 작업 완료 표시 (체크박스)
├─ markAsWorked() 뮤테이션
│  └─ 작업 완료 표시
├─ unmarkAsWorked() 뮤테이션
│  └─ 작업 완료 취소
└─ ErrorBoundary (L2)
```

---

## 폼 진입점

### CommissionRegisterForm

**경로**: `src/components/pages/commission/CommissionRegisterForm.tsx`

```
CommissionRegisterForm (React Hook Form)
├─ useForm 초기화
│  └─ Zod 스키마 검증
├─ 폼 필드
│  ├─ RegisterFormSongTitle (곡명 검색)
│  │  └─ findSongByTitle() (중복 확인)
│  ├─ RegisterFormComposer (작곡가)
│  ├─ RegisterFormVersion (악보 버전)
│  ├─ InstrumentPicker (악기)
│  ├─ 마감일 (DatePicker)
│  ├─ 요구사항 (Textarea)
│  └─ 이미지 (Dropzone)
└─ useCreateCommission() 뮤테이션
   └─ 제출 시 저장 → CommissionDetail 리다이렉트
```

### ScoreRegisterForm

**경로**: `src/components/pages/score/ScoreRegisterForm.tsx`

```
ScoreRegisterForm (React Hook Form)
├─ useForm 초기화
│  └─ Zod 스키마
├─ 곡 등록
│  ├─ RegisterFormSongTitle (곡명)
│  ├─ RegisterFormComposer (작곡가)
│  └─ useCreateSong() 뮤테이션
├─ 편성 등록
│  ├─ RegisterFormVersion (편성 이름)
│  └─ InstrumentPicker (악기)
└─ 파일 업로드
   ├─ ZipUploadCard (ZIP 선택)
   └─ useUploadArrangementFile() 뮤테이션
```

---

## 모달 & 오버레이 진입점

### Dialog 컴포넌트 (overlay-kit)

| 모달 | 경로 | 트리거 |
|------|------|--------|
| **CompleteDialog** | `src/components/pages/commission/` | CommissionDetail 의뢰 완료 |
| **DeleteCommissionDialog** | `src/components/pages/commission/` | CommissionDetail/List 의뢰 삭제 |
| **ReceiveAndSendDialog** | `src/components/pages/commission/` | CommissionDetail 상태 변경 |
| **AnalyzeImage** | `src/components/pages/commission/` | CommissionDetail 이미지 분석 |
| **CommissionImageDialog** | `src/components/pages/commission/` | 이미지 미리보기 |
| **DeleteArrangementDialog** | `src/components/pages/score/` | ScoreDetail 편성 삭제 |
| **DeleteSongDialog** | `src/components/pages/scores/` | ScoreList 곡 삭제 |
| **ExcelUploadDialog** | `src/components/` | SalesStats Excel 파일 선택 |

---

## 네비게이션 진입점

### 메인 네비게이션 (AppLayout)

**`src/components/layout/AppLayout.tsx`**

```
Header
├─ Logo/Title
├─ 검색 바
└─ 사용자 메뉴
   ├─ Settings
   ├─ Logout
   └─ Theme Toggle

Sidebar
├─ Dashboard (/)
├─ Commissions
│  ├─ 의뢰 목록 (/commissions)
│  ├─ 신규 등록 (/new)
│  ├─ 달력 (/calendar)
│  └─ 설정 (/settings)
├─ Scores
│  ├─ 악보 목록 (/scores 또는 /files)
│  └─ 신규 등록 (/scores/new)
├─ Sales
│  ├─ 통계 (/stats)
│  └─ Excel 업로드 (/files)
└─ Recommend (/recommend)
```

---

## 쿼리 캐시 무효화 진입점

### Mutation Success Callbacks

**Commission**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: commissionKeys.all });
}
```

**Score**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: scoreKeys.all });
}
```

**Stats**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: statsKeys.all });
  // 또는 특정 쿼리
  queryClient.invalidateQueries({ queryKey: statsKeys.salesRows() });
}
```

**Recommendation**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: recommendationKeys.workedSongIds() });
}
```

---

## 에러 처리 진입점

### ErrorBoundary 계층

| 레벨 | 경로 | 역할 | 폴백 |
|------|------|------|------|
| **L1 Global** | App.tsx | 렌더링 에러 캐치 | 스택 트레이스 + 새로고침 버튼 |
| **L2 Page** | 각 페이지 | 페이지별 에러 격리 | 페이지별 에러 메시지 |
| **L3 Section** | Dashboard 섹션 | 섹션별 독립 처리 | 섹션별 폴백 UI |

**사용 예**
```typescript
<ErrorBoundary level="page" onError={(error) => console.error(error)}>
  <CommissionDetail />
</ErrorBoundary>
```

### React Query 에러 처리

```typescript
useQuery({
  queryKey: commissionKeys.detail(id),
  queryFn: () => getCommission(id),
  onError: (error) => {
    toast({
      title: '데이터 로드 실패',
      description: error.message,
      variant: 'destructive'
    });
  }
});
```

---

## 상태 초기화 진입점

### AuthProvider 게스트 모드

```typescript
// 게스트 모드 진입
enterGuestMode() → {
  sessionStorage.setItem('guest_mode', 'true');
  queryClient.clear(); // 모든 캐시 삭제
}

// 게스트 모드 종료
exitGuestMode() → {
  sessionStorage.removeItem('guest_mode');
  queryClient.clear();
  logout(); // Supabase 로그아웃
}
```

### Theme 토글

**`src/provider/ThemeProvider.tsx`**
```typescript
// localStorage에 저장
localStorage.setItem('theme', isDark ? 'dark' : 'light');
```

---

## 환경별 설정

### 개발 환경
```bash
# .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 프로덕션 환경
```bash
# Vercel Environment Variables
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Vite 프록시 설정 (Soundpost)
```typescript
// vite.config.ts
proxy: {
  '/api/soundpost': {
    target: 'https://api.soundpost.kr',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/soundpost/, '')
  }
}
```
