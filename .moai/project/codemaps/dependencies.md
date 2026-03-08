# Blueberry 의존성 맵

## 모듈 간 의존성 그래프

```
Pages
├─ Index.tsx
│  ├─ commission/getCommissions() → commissionKeys.list
│  ├─ stats/getSalesSummary() → statsKeys.salesSummary
│  ├─ commission/getMonthlyCommissionCounts() → commissionKeys.monthlyCounts
│  ├─ MonthlyChart
│  ├─ CommissionSummaryBar
│  └─ ErrorBoundary (L2)
│
├─ CommissionList.tsx
│  ├─ commission/getCommissions()
│  ├─ commission/deleteCommission()
│  └─ ErrorBoundary (L2)
│
├─ CommissionDetail.tsx
│  ├─ commission/getCommission(id)
│  ├─ commission/updateCommissionStatus()
│  ├─ commission/uploadCommissionImage()
│  ├─ AnalyzeImage → analyzeCommissionImage() [Edge Function]
│  ├─ CompleteDialog
│  ├─ DeleteCommissionDialog
│  └─ ErrorBoundary (L2)
│
├─ ScoreDetail.tsx
│  ├─ score/getArrangement(arrangementId)
│  ├─ score/deleteArrangementFile()
│  ├─ score/uploadArrangementFile()
│  ├─ FileEntryList
│  └─ ErrorBoundary (L2)
│
├─ SalesStats.tsx
│  ├─ stats/getSalesSummary()
│  ├─ stats/getMonthlySales(year)
│  ├─ stats/getMonthlyCategoryBreakdown(year)
│  ├─ stats/getCategoryDistribution()
│  ├─ stats/getTopSongs()
│  ├─ stats/getTopArrangements()
│  ├─ stats/getTopSongMonthlySales(year)
│  ├─ stats/getSalesYearRange()
│  ├─ stats/getSalesRows(year)
│  ├─ Stats, YearlyStats, SalesAll
│  └─ ErrorBoundary (L2)
│
├─ MusicRecommend.tsx
│  ├─ recommendation/getTodayRecommendation()
│  ├─ recommendation/getRecentRecommendations()
│  ├─ recommendation/getAllRecommendations()
│  ├─ recommendation/getWorkedSongIds()
│  ├─ recommendation/markAsWorked()
│  ├─ recommendation/unmarkAsWorked()
│  ├─ RecommendCard
│  ├─ SidePanel
│  └─ ErrorBoundary (L2)
│
├─ ExcelUploadDetail.tsx
│  ├─ stats/getSalesRowsByUploadId(uploadId)
│  ├─ stats/deleteExcelUpload()
│  └─ ErrorBoundary (L2)
│
└─ Login.tsx
   ├─ auth/login()
   └─ AuthProvider → onAuthStateChange()

App.tsx (전역 프로바이더)
├─ ErrorBoundary (L1 Global)
├─ QueryClientProvider → src/utils/query-client.ts
│  └─ queryClient 설정
├─ ThemeProvider
├─ AuthProvider
│  ├─ auth/getSession()
│  ├─ auth/onAuthStateChange()
│  ├─ AuthContext
│  └─ sessionStorage ('guest_mode')
├─ OverlayProvider
├─ Sonner (Toast)
└─ BrowserRouter (React Router v6)

ProtectedRoute
└─ AuthContext (session 체크)
```

---

## 내부 모듈 의존성

### Commission 모듈 의존성
```
commission/index.ts
├─ supabase.ts
├─ types/commission (Commission, CreateCommissionInput)
└─ constants/status-config (CommissionStatus)

commission/mutations.ts
├─ commission/queryKeys.ts
├─ commission/index.ts (함수)
└─ react-query (useMutation, useQueryClient)

commission/queryKeys.ts
└─ (독립적)
```

### Score 모듈 의존성
```
score/index.ts
├─ supabase.ts
├─ types/score (Song, Arrangement, ArrangementFile)
└─ constants/file-types (ALLOWED_EXTENSIONS, MAX_FILE_SIZE)

score/mutations.ts
├─ score/queryKeys.ts
├─ score/index.ts (함수)
└─ react-query (useMutation, useQueryClient)

score/queryKeys.ts
└─ (독립적)
```

### Stats 모듈 의존성
```
stats/index.ts
├─ supabase.ts
├─ types/stats (SalesSummary, MonthlySale, CategoryDistributionItem)
├─ types/excel (ExcelRow)
├─ utils/split-product (product 문자열 파싱)
├─ constants/month (MONTH 상수)
└─ 매직 상수:
   - MAX_ROWS = 100,000
   - CATEGORIES = {'CLASSIC', 'POP', 'K-POP', 'OST', 'ANI', 'ETC'}

stats/mutations.ts
├─ stats/queryKeys.ts
├─ stats/index.ts (함수)
└─ react-query

stats/queryKeys.ts
└─ (독립적)
```

### Recommendation 모듈 의존성
```
recommendation/index.ts
├─ supabase.ts
└─ mock/recommendations (MusicRecommendation 타입)

recommendation/queryKeys.ts
└─ (독립적)
```

### Auth 모듈 의존성
```
auth/index.ts
└─ supabase.ts
```

---

## 외부 패키지 의존성

### Core Framework & Build
| 패키지 | 버전 | 용도 |
|--------|------|------|
| **react** | 18.x | UI 라이브러리 |
| **react-dom** | 18.x | DOM 렌더링 |
| **typescript** | 5.x | 타입 체킹 |
| **vite** | 5.x | 번들러 & Dev 서버 |
| **tailwindcss** | 3.x | CSS 유틸리티 프레임워크 |

### 상태 관리 & 데이터 페칭
| 패키지 | 용도 |
|--------|------|
| **@tanstack/react-query** | 서버 상태 관리 (queries, mutations, caching) |
| **@tanstack/react-query-devtools** | React Query 디버깅 |
| **zustand** | (사용하지 않음 - Context API 사용) |

### 라우팅
| 패키지 | 용도 |
|--------|------|
| **react-router-dom** | 클라이언트 라우팅 |
| **react-router-dom/lazy** | Lazy loading |

### UI 컴포넌트
| 패키지 | 용도 |
|--------|------|
| **shadcn/ui** | 재사용 UI 컴포넌트 (Radix UI 기반) |
| **@radix-ui/primitives** | 접근성 있는 UI 프리미티브 |
| **recharts** | 차트 시각화 |
| **sonner** | Toast 알림 메시지 |
| **overlay-kit** | 모달/오버레이 관리 |

### 폼 & 검증
| 패키지 | 용도 |
|--------|------|
| **react-hook-form** | 폼 상태 관리 |
| **zod** | 런타임 타입 검증 |
| **@hookform/resolvers** | RHF + Zod 통합 |

### 백엔드 통합
| 패키지 | 용도 |
|--------|------|
| **@supabase/supabase-js** | Supabase 클라이언트 SDK (Auth, DB, Storage) |
| **supabase** | Supabase CLI (개발용) |

### 파일 처리
| 패키지 | 용도 |
|--------|------|
| **exceljs** | Excel 파일 읽기/쓰기 |
| **xlsx** | Excel 파싱 |
| **jszip** | ZIP 파일 처리 |

### 유틸리티
| 패키지 | 용도 |
|--------|------|
| **clsx** | 조건부 CSS 클래스 |
| **date-fns** | 날짜 포매팅 & 조작 |
| **lodash-es** | 유틸 함수 (debounce, groupBy 등) |

### 개발 도구
| 패키지 | 용도 |
|--------|------|
| **@vercel/analytics** | Vercel Analytics 추적 |
| **@vercel/speed-insights** | 웹 바이탈 모니터링 (LCP, FID, CLS) |
| **vitest** | 단위 테스트 |
| **@testing-library/react** | 컴포넌트 테스트 |
| **msw** | API 모킹 (테스트용) |
| **eslint** | 코드 린팅 |
| **prettier** | 코드 포매팅 |

### PWA & Service Worker
- **src/main.tsx** - Service Worker 등록
- **public/sw.js** - PWA manifest, icon 설정

---

## 백엔드 의존성

### Supabase
- **PostgreSQL** - 메인 데이터베이스
- **Supabase Auth** - 사용자 인증
- **Supabase Storage** - 파일 저장소 (이미지, 악보)
- **Supabase Edge Functions** - 서버리스 함수 (Node.js)

### Supabase Edge Functions 목록

| 함수 | 호출 위치 | 목적 |
|------|---------|------|
| **analyze-commission** | CommissionDetail.tsx→AnalyzeImage | 의뢰 이미지 AI 분석 (Claude API) |
| **send-score-email** | Supabase Trigger | 악보 등록 시 이메일 알림 |
| **send-push** | Supabase Scheduler | Web Push 알림 (마감일) |
| **generate-recommendation** | Supabase Scheduler | 일일 추천곡 생성 |
| **check-deadlines** | Supabase Scheduler | 마감일 도래 확인 & 알림 |

### 외부 API 통합

| 서비스 | 엔드포인트 | 용도 |
|--------|-----------|------|
| **Soundpost API** | `https://api.soundpost.kr/*` | 음악 레퍼런스 검색 |
| **Claude API** | (Edge Function 내부 호출) | AI 이미지 분석 |
| **Vercel Analytics** | `https://va.vercel-analytics.com/*` | 성능 추적 |
| **Web Push API** | Browser API | 마감일 알림 구독 |

---

## 환경 변수 의존성

### 필수 (`.env.local`)
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 선택사항
```bash
VITE_SOUNDPOST_API_URL=https://api.soundpost.kr
VITE_VERCEL_ANALYTICS_ID=...
```

---

## 런타임 의존성 (클라이언트)

### Browser APIs
- **IndexedDB** - React Query 캐시 (optional)
- **localStorage** - 테마 설정
- **sessionStorage** - 게스트 모드 플래그
- **Service Worker API** - PWA
- **Web Push API** - 마감일 알림
- **File API** - 파일 업로드 (Dropzone)
- **Canvas API** - 차트 렌더링 (Recharts)

### 네트워크 요구사항
- **CORS** - Supabase, Soundpost API
- **WebSocket** - Supabase Realtime (옵션)
- **HTTP/2** - 멀티플렉싱

---

## 의존성 그룹 & 버전 호환성

### React Query 관련
```typescript
// src/utils/query-client.ts
QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5분
      gcTime: 1000 * 60 * 10,         // 10분
      retry: 2,
      retryDelay: exponential backoff
    },
    mutations: {
      retry: 0  // 변경 작업은 재시도 금지
    }
  }
})
```

### Supabase 클라이언트 설정
```typescript
// src/lib/supabase.ts
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### React Router 설정
```typescript
// src/App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<Protected />}>
      {/* 보호된 라우트들 */}
    </Route>
  </Routes>
</BrowserRouter>
```

---

## 순환 의존성 (Circular Dependencies) 점검

**없음** - 모듈은 명확한 계층 구조를 따름:
1. Pages (최상위)
2. API 모듈 (Commission, Score, Stats, Recommendation, Auth)
3. 유틸리티 & 라이브러리 (supabase.ts, query-client.ts)

---

## 성능 관련 의존성

| 최적화 항목 | 의존성 | 설정 |
|------------|--------|------|
| **번들 크기** | Vite tree-shaking | shadcn/ui 동적 임포트 |
| **코드 분할** | React.lazy + Suspense | 각 Page 컴포넌트 |
| **캐싱** | React Query | staleTime=5분 |
| **이미지 최적화** | Vercel 자동 최적화 | Next.js 미사용 (수동) |
| **차트 성능** | Recharts memo | SalesStats에서 병렬 쿼리 |
| **API 배치** | Promise.all() | stats/getSalesSummary (5개 쿼리) |

---

## 보안 관련 의존성

| 항목 | 의존성 | 구현 |
|------|--------|------|
| **입력 검증** | Zod | CommissionRegisterForm, ScoreRegisterForm |
| **파일 업로드** | File API + validation | ALLOWED_EXTENSIONS, MAX_FILE_SIZE |
| **인증** | Supabase Auth | @supabase/supabase-js |
| **Row Level Security** | PostgreSQL RLS | Supabase 설정 |
| **환경 변수** | Vite import.meta.env | VITE_* 프리픽스 |

---

## 마이그레이션 가능 의존성 (Future)

| 패키지 | 대체 가능 | 사유 |
|--------|---------|------|
| **zustand** | Context API | 현재 Context API 사용 중 |
| **RTK Query** | React Query | 이미 React Query 사용 중 |
| **Next.js** | Vite | CSR 충분하면 Vite 유지 |
| **Prisma** | Supabase SDK | 서버리스 선호 시 Prisma Edge 검토 |
| **MSW** | Supabase 모의 모듈 | 테스트 규모 확대 시 |
