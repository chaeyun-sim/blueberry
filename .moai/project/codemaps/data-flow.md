# Blueberry 데이터 흐름 맵

## 1. 의뢰 생성 흐름

```
사용자 액션: CommissionRegister.tsx 진입
    │
    ▼
CommissionRegisterForm (React Hook Form + Zod)
    │
    ├─ 곡명 입력 → findSongByTitle() [선택사항]
    │  └─ Supabase: SELECT id, title, composer FROM songs
    │     WHERE ILIKE(title) AND ILIKE(composer) AND deleted_at IS NULL
    │
    ├─ 작곡가 입력
    │
    ├─ 편성 선택 (악기, 버전)
    │
    ├─ 마감일 선택
    │
    ├─ 요구사항 입력 (Textarea)
    │
    ├─ 이미지 업로드 (Dropzone)
    │  └─ FileReader 읽기 → Base64 변환
    │
    └─ 폼 제출
       │
       ▼
    useCreateCommission() 뮤테이션 실행
       │
       ├─ Step 1: createCommission(input)
       │  └─ Supabase: INSERT INTO commissions
       │     (id, user_id, song_id, deadline, requirement, status, created_at)
       │     VALUES (...)
       │     RETURNING *
       │  └─ 응답: Commission 객체
       │
       ├─ Step 2: uploadCommissionImage(commissionId, imageFile) [선택사항]
       │  └─ Supabase Storage: PUT /commission-images/{commissionId}.{ext}
       │  └─ 응답: publicUrl (CDN URL)
       │
       ├─ Step 3: analyzeCommissionImage(base64, mediaType) [선택사항]
       │  └─ Supabase Edge Function: POST /functions/v1/analyze-commission
       │     Body: { imageBase64, mediaType }
       │  └─ Claude API 호출 (Edge Function 내부)
       │  └─ 응답: { arrangements, estimated_price, notes }
       │
       └─ onSuccess 콜백
          │
          ├─ queryClient.invalidateQueries(commissionKeys.all)
          │  └─ CommissionList 자동 갱신
          │
          └─ navigate(`/commissions/${commissionId}`)
             └─ CommissionDetail 페이지로 이동

성공 시나리오:
commissionKeys.list() 캐시 자동 갱신
 → CommissionList 리렌더 → 신규 항목 맨 위에 추가

실패 시나리오:
 → onError 콜백
    └─ toast({ title: '의뢰 등록 실패', variant: 'destructive' })
    └─ 폼 유지 (사용자가 다시 제출 가능)
```

### 데이터 구조

```typescript
// 입력
type CreateCommissionInput = {
  song_id: string;
  deadline: string;  // ISO 8601
  requirement?: string;
  status: CommissionStatus; // 'received'
  image_url?: string;
}

// 출력 (Supabase 응답)
type Commission = {
  id: string;                    // UUID
  user_id: string;               // Auth user ID
  song_id?: string;
  deadline: string;              // ISO 8601
  requirement?: string;
  status: CommissionStatus;      // 'received' | 'in_progress' | 'completed' | 'pending'
  created_at: string;
  updated_at: string;
  songs?: {
    title: string;
    composer: string;
  }
}

// Edge Function 응답
type AnalyzeImageResponse = {
  arrangements: string[];        // ['Solo Piano', 'String Quartet']
  estimated_price: number;
  notes: string;
}
```

---

## 2. 악보 조회 및 파일 관리 흐름

```
사용자 액션: ScoreDetail.tsx 진입 (scoreId, arrangementId)
    │
    ▼
페이지 로드
    │
    ├─ useQuery(scoreKeys.arrangement(arrangementId))
    │  │
    │  └─ getArrangement(arrangementId)
    │     │
    │     └─ Supabase: SELECT *, arrangement_files(*), songs(...)
    │        FROM arrangements
    │        WHERE id = arrangementId AND deleted_at IS NULL
    │     │
    │     └─ 응답: Arrangement 객체
    │
    └─ 편성 정보 렌더링
       │
       ├─ 곡명, 작곡가 표시
       ├─ 악기 정보 표시
       │
       └─ FileEntryList (파일 목록)
          │
          ├─ 각 파일 항목:
          │  ├─ 파일명 표시
          │  ├─ 파일 타입 아이콘 (PDF, ZIP 등)
          │  ├─ 다운로드 버튼 → publicUrl 다이렉트 링크
          │  └─ 삭제 버튼 → DeleteArrangementFileDialog
          │
          └─ 파일 업로드 (ZipUploadCard)
             │
             ▼
          사용자 파일 선택
             │
             ├─ 파일 확장자 검증 (ALLOWED_EXTENSIONS)
             ├─ 파일 크기 검증 (MAX_FILE_SIZE = 50MB)
             │
             └─ useUploadArrangementFile() 뮤테이션
                │
                ├─ Step 1: 파일명 정규화
                │  └─ `{arrangementId}/{label}.{ext}` 경로 생성
                │
                ├─ Step 2: uploadArrangementFile(file, label)
                │  │
                │  ├─ Supabase Storage: PUT /arrangement-files/{path}
                │  │  (upsert: true → 덮어쓰기 허용)
                │  │
                │  ├─ publicUrl 조회
                │  │  └─ CDN URL 반환
                │  │
                │  └─ 응답: publicUrl
                │
                ├─ Step 3: createArrangementFile(arrangementId, label, fileType, url)
                │  │
                │  └─ Supabase: INSERT INTO arrangement_files
                │     (arrangement_id, label, file_type, url)
                │     VALUES (...)
                │     RETURNING *
                │
                └─ onSuccess 콜백
                   │
                   ├─ queryClient.invalidateQueries(scoreKeys.arrangement(arrangementId))
                   │  └─ FileEntryList 자동 갱신
                   │
                   └─ toast({ title: '파일 업로드 완료' })

파일 삭제 흐름:
    │
    └─ 사용자 삭제 클릭
       │
       └─ DeleteArrangementFileDialog 확인
          │
          └─ useDeleteArrangementFile() 뮤테이션
             │
             ├─ Step 1: arrangement_files 테이블에서 url 조회
             │  └─ SELECT url FROM arrangement_files WHERE id = fileId
             │
             ├─ Step 2: url에서 Storage 경로 추출
             │  └─ path = url.split('/arrangement-files/')[1]
             │
             ├─ Step 3: Supabase Storage 삭제 (hard delete)
             │  └─ DELETE /arrangement-files/{path}
             │
             ├─ Step 4: DB 행 삭제
             │  └─ DELETE FROM arrangement_files WHERE id = fileId
             │
             └─ onSuccess 콜백
                ├─ queryClient.invalidateQueries(scoreKeys.arrangement(arrangementId))
                └─ toast({ title: '파일 삭제 완료' })

성공 시:
 → FileEntryList 자동 갱신 (파일 항목 제거)

실패 시:
 → Storage 삭제 성공하면 DB 삭제 실패 → 고아 파일 가능성
    (따라서 두 단계 모두 성공할 때만 완료로 간주)
```

### 데이터 구조

```typescript
// Arrangement (편성)
type Arrangement = {
  id: string;
  song_id: string;
  arrangement: string;           // '현악4중주', 'Solo Piano' 등
  instrument?: string;
  created_at: string;
  deleted_at?: string;           // soft delete
  arrangement_files: ArrangementFile[];
  songs?: {
    id: string;
    title: string;
    composer: string;
    english_title?: string;
  }
}

// ArrangementFile (파일)
type ArrangementFile = {
  id: string;
  arrangement_id: string;
  label: string;                 // '스코어', 'Part A' 등
  file_type: string;             // 'pdf', 'zip' 등
  url: string;                   // CDN URL
  created_at: string;
}

// 파일 업로드 입력
type UploadInput = {
  arrangementId: string;
  file: File;
  label: string;
}

// 유효성 검사
const ALLOWED_EXTENSIONS = ['pdf', 'zip', 'docx', 'pptx'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;  // 50MB
```

---

## 3. 매출 통계 조회 흐름

```
사용자 액션: SalesStats.tsx 진입
    │
    ▼
페이지 로드 (병렬 8개 쿼리 발행)
    │
    ├─ useQuery(statsKeys.salesSummary())
    │  └─ getSalesSummary()
    │     │
    │     └─ Supabase 병렬 조회 (Promise.all)
    │        ├─ 올해 전체 매출
    │        ├─ 작년 전체 매출
    │        ├─ 지난달 매출
    │        └─ 전월 매출
    │     │
    │     └─ 계산 (클라이언트)
    │        ├─ thisYearRevenue vs lastYearRevenue → revenueVsLastYear (%)
    │        ├─ thisYearCount vs lastYearCount → countVsLastYear (%)
    │        ├─ lastMonthRevenue vs prevPrevRevenue → revenueVsLastMonth (%)
    │        └─ lastMonthCount vs prevPrevCount → countVsLastMonth (%)
    │     │
    │     └─ 응답: SalesSummary
    │
    ├─ useQuery(statsKeys.monthlySales(year))
    │  └─ getMonthlySales(year)
    │     │
    │     └─ Supabase 병렬 조회
    │        ├─ 올해 월별 판매 (매출액, 건수)
    │        └─ 작년 월별 판매 (비교용)
    │     │
    │     └─ 계산 (클라이언트)
    │        ├─ 1월~12월 루프
    │        └─ 각 월별 집계 (revenue, count)
    │     │
    │     └─ 응답: MonthlySale[]
    │
    ├─ useQuery(statsKeys.monthlyCategoryBreakdown(year))
    │  └─ getMonthlyCategoryBreakdown(year)
    │     │
    │     └─ Supabase: SELECT sold_at, amount, category
    │        FROM sales WHERE ... LIMIT 100,000
    │     │
    │     └─ 계산 (클라이언트)
    │        ├─ 카테고리별 월별 집계
    │        │  {'CLASSIC': 0, 'POP': 0, 'K-POP': 0, 'OST': 0, 'ANI': 0, 'ETC': 0}
    │        └─ 각 월별 분포 계산
    │     │
    │     └─ 응답: MonthlyCategoryData[]
    │
    ├─ useQuery(statsKeys.categoryDistribution())
    │  └─ getCategoryDistribution()
    │     │
    │     └─ Supabase: SELECT amount, category FROM sales
    │        LIMIT 100,000
    │     │
    │     └─ 계산 (클라이언트)
    │        ├─ 전체 매출액 합계
    │        ├─ 전체 판매 건수 합계
    │        └─ 각 카테고리별:
    │           - value: (revenue / grandTotal) * 100  (%)
    │           - count: 판매 건수
    │           - countShare: (count / grandCount) * 100  (%)
    │     │
    │     └─ 응답: CategoryDistributionItem[]
    │
    ├─ useQuery(statsKeys.topSongs())
    │  └─ getTopSongs(topN=5)
    │     │
    │     └─ Supabase: SELECT amount, category, product FROM sales
    │        LIMIT 100,000
    │     │
    │     └─ 계산 (클라이언트)
    │        ├─ product 문자열 파싱 (splitProduct: "곡명 - 편성" → {song, arrangement})
    │        ├─ 곡별 판매 건수 & 매출액 집계
    │        └─ 건수순 정렬 후 TOP 5 추출
    │     │
    │     └─ 응답: TopSong[] (rank, title, category, sales, revenue)
    │
    ├─ useQuery(statsKeys.topArrangements())
    │  └─ getTopArrangements(topN=5)
    │     │
    │     └─ product 파싱 후 편성별 집계
    │     │  (곡명 - 편성 → 편성만 추출)
    │     │
    │     └─ 응답: TopArrangement[] (rank, arrangement, sales, revenue)
    │
    ├─ useQuery(statsKeys.topSongMonthlySales(year))
    │  └─ getTopSongMonthlySales(year, topN=5)
    │     │
    │     └─ Supabase: SELECT sold_at, product FROM sales WHERE year
    │        LIMIT 100,000
    │     │
    │     └─ 계산 (클라이언트)
    │        ├─ TOP 5 곡 식별
    │        ├─ 1월~12월 각 TOP 곡별 판매 건수 계산
    │        └─ 월별 라인 데이터 생성 (song1, song2, ... song5 컬럼)
    │     │
    │     └─ 응답: TopSongMonthlySalesResult
    │           { data: [{ month, song1, song2, ... }], config: {...} }
    │
    └─ useQuery(statsKeys.salesYearRange())
       └─ getSalesYearRange()
          │
          └─ Supabase 병렬 조회
             ├─ SELECT sold_at FROM sales ORDER BY asc LIMIT 1
             └─ SELECT sold_at FROM sales ORDER BY desc LIMIT 1
          │
          └─ 응답: { min: 2020, max: 2025 }
             (연도 드롭다운 옵션 생성)

모든 쿼리 완료 후:
    │
    └─ 컴포넌트 렌더링
       │
       ├─ SalesCards (4개 요약 카드)
       │  └─ salesSummary 데이터 사용
       │
       ├─ MonthlyGrowthRateChart
       │  └─ monthlySales + monthlyCategoryBreakdown 데이터
       │
       ├─ CategoryGrowthRateChart
       │  └─ monthlyCategoryBreakdown 데이터
       │
       ├─ Stats (통계 탭)
       │  ├─ CategoriesPieChart
       │  │  └─ categoryDistribution 데이터
       │  ├─ TopSongBar
       │  │  └─ topSongs 데이터
       │  ├─ TopArrangementsRadar
       │  │  └─ topArrangements 데이터
       │  └─ TopSongMonthlyLineChart
       │     └─ topSongMonthlySales 데이터
       │
       └─ SalesAll (판매 행 테이블)
          └─ salesRows 데이터 (별도 쿼리)

캐시 전략:
 - staleTime: 5분
   → 5분 내 같은 쿼리 재요청 시 캐시 사용
 - gcTime: 10분
   → 10분 후 메모리에서 제거
 - retry: 2회
   → 실패 시 exponential backoff로 최대 2회 재시도
```

### 데이터 구조

```typescript
type SalesSummary = {
  totalRevenue: number;
  totalCount: number;
  lastMonthRevenue: number;
  lastMonthCount: number;
  revenueVsLastYear: number;     // %
  countVsLastYear: number;       // %
  revenueVsLastMonth: number;    // %
  countVsLastMonth: number;      // %
}

type MonthlySale = {
  month: string;                 // '1월', '2월' 등
  revenue: number;
  count: number;
  prevRevenue: number;           // 작년 동월
  prevCount: number;
}

type MonthlyCategoryData = {
  month: string;
  CLASSIC: number;
  POP: number;
  'K-POP': number;
  OST: number;
  ANI: number;
  ETC: number;
}

type CategoryDistributionItem = {
  name: string;
  value: number;                 // %
  count: number;
  countShare: number;            // %
  revenue: number;               // 실제 금액
}

type TopSong = {
  rank: number;
  title: string;
  category: string;
  sales: number;                 // 판매 건수
  revenue: number;               // 매출액
}

type TopSongMonthlySalesResult = {
  data: Array<{
    month: string;
    song1: number;
    song2: number;
    song3: number;
    song4: number;
    song5: number;
  }>;
  config: {
    song1: string;               // 곡명
    song2: string;
    song3: string;
    song4: string;
    song5: string;
  };
}

type ExcelRow = {
  id?: string;
  category: string;              // 'CLASSIC', 'POP' 등
  product: string;               // "곡명 - 편성"
  amount: number;                // 매출액
}
```

---

## 4. Excel 매출 데이터 임포트 흐름

```
사용자 액션: Files.tsx (Excel 탭)
    │
    ▼
사용자 "파일 선택" 클릭
    │
    └─ ExcelUploadDialog 열기
       │
       ▼
    Excel 파일 선택 (.xlsx)
       │
       ▼
    parseExcelFile(file) [클라이언트]
       │
       ├─ exceljs/xlsx로 파일 파싱
       │  └─ 각 행 읽기
       │
       ├─ 컬럼 매핑
       │  ├─ category (CLASSIC, POP, K-POP, OST, ANI)
       │  ├─ product ("곡명 - 편성" 형식)
       │  └─ amount (매출액, 숫자)
       │
       └─ ExcelRow[] 배열 생성
          │
          ▼
       미리보기 테이블 표시
          │
          ▼
       사용자 "저장" 클릭
          │
          └─ useSaveSalesRows() 뮤테이션
             │
             ├─ Step 1: excel_uploads 레코드 생성
             │  │
             │  └─ Supabase: INSERT INTO excel_uploads
             │     (name, row_count)
             │     VALUES ("2025-03", 150)
             │     RETURNING id
             │  │
             │  └─ uploadId 획득
             │
             ├─ Step 2: 룩업 테이블 병렬 조회
             │  │
             │  ├─ SELECT id, title FROM songs WHERE deleted_at IS NULL
             │  │  └─ songMap: Map<norm(title), song_id>
             │  │
             │  └─ SELECT id, song_id, arrangement FROM arrangements WHERE deleted_at IS NULL
             │     └─ arrangementMap: Map<`${song_id}:${norm(arrangement)}`, arrangement_id>
             │
             ├─ Step 3: ExcelRow[] → sales 레코드 변환
             │  │
             │  └─ 각 행 처리:
             │     ├─ product 문자열 파싱 (splitProduct)
             │        └─ "곡명 - 편성" → {song: '곡명', arrangement: '편성'}
             │     │
             │     ├─ song_id 룩업
             │     │  └─ songMap.get(norm(songTitle)) || null
             │     │
             │     ├─ arrangement_id 룩업
             │     │  └─ song_id가 있으면:
             │     │     arrangementMap.get(`${song_id}:${norm(arrangementStr)}`) || null
             │     │
             │     └─ sales 행 생성:
             │        {
             │          song_id,           // nullable
             │          arrangement_id,    // nullable
             │          upload_id,
             │          category,
             │          product,
             │          amount,
             │          sold_at            // uploadName에서 유도된 날짜
             │        }
             │
             ├─ Step 4: 청크 단위 insert (CHUNK_SIZE = 500)
             │  │
             │  └─ for (let i = 0; i < inserts.length; i += 500)
             │     └─ Supabase: INSERT INTO sales
             │        VALUES (...)
             │  │
             │  └─ 개별 insert 실패 시:
             │     ├─ 즉시 중단
             │     └─ 고아 upload 레코드 삭제 (DELETE FROM excel_uploads)
             │
             └─ onSuccess 콜백
                │
                ├─ queryClient.invalidateQueries(statsKeys.all)
                │  → 통계 캐시 전체 갱신
                │
                ├─ queryClient.invalidateQueries(statsKeys.excelUploads)
                │  → 업로드 목록 갱신
                │
                └─ toast({ title: '데이터 저장 완료', description: '150행 저장됨' })

성공 시:
 → SalesStats의 모든 차트 자동 갱신
    (salesSummary, monthlySales 등)

실패 시:
 → onError 콜백
    └─ toast({ title: '저장 실패', variant: 'destructive' })
    └─ 업로드 레코드 자동 롤백됨

중요: product 문자열 매핑
 ├─ "곡명 - 편성" 형식 필수
 ├─ norm() 함수로 정규화 (소문자, 공백 제거, 기호 제거)
 └─ 정확한 매칭으로 song_id/arrangement_id 결정
    (실패해도 저장됨 - product 문자열은 항상 유지)
```

### 데이터 구조

```typescript
// 업로드 입력
type SaveSalesRowsInput = {
  rows: ExcelRow[];              // parseExcelFile() 결과
  uploadName: string;            // "2025-03" 등
}

// 업로드 날짜 유도 로직
const uploadDate = (() => {
  const m1 = uploadName.match(/(\d{4})[^\d](\d{2})/);  // "2025-03" → "2025-03-01"
  if (m1) return `${m1[1]}-${m1[2]}-01 00:00:00`;

  const m2 = uploadName.match(/(\d{4})(\d{2})/);       // "202503" → "2025-03-01"
  if (m2) return `${m2[1]}-${m2[2]}-01 00:00:00`;

  return new Date().toISOString().slice(0, 10) + ' 00:00:00';
})();

// Supabase 저장 구조
type SalesInsert = {
  song_id: string | null;
  arrangement_id: string | null;
  upload_id: string;
  category: string;
  product: string;
  amount: number;
  sold_at: string;               // ISO 형식
}

// 룩업 테이블
const norm = (s: string) =>
  s.toLowerCase()
    .replace(/\s*([(),])\s*/g, '$1')  // 기호 주변 공백 제거
    .trim();

const songMap = new Map<string, string>();      // norm(title) → song_id
const arrangementMap = new Map<string, string>(); // `${song_id}:${norm(arr)}` → arrangement_id
```

---

## 5. 추천곡 작업 완료 추적 흐름

```
사용자 액션: MusicRecommend.tsx 진입
    │
    ▼
페이지 로드 (병렬 4개 쿼리)
    │
    ├─ useQuery(recommendationKeys.today())
    │  └─ getTodayRecommendation()
    │     │
    │     └─ 현재 시간 KST로 변환
    │        today = new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0]
    │     │
    │     └─ Supabase: SELECT * FROM recommendations
    │        WHERE recommended_date = '2025-03-05'
    │        LIMIT 1
    │     │
    │     └─ 응답: MusicRecommendation | null
    │
    ├─ useQuery(recommendationKeys.recent())
    │  └─ getRecentRecommendations(limit=30)
    │     │
    │     └─ Supabase: SELECT * FROM recommendations
    │        ORDER BY recommended_date DESC
    │        LIMIT 30
    │     │
    │     └─ 응답: { date, rec }[] (최근 30일)
    │
    ├─ useQuery(recommendationKeys.all())
    │  └─ getAllRecommendations()
    │     │
    │     └─ Supabase: SELECT * FROM recommendations
    │        ORDER BY recommended_date DESC
    │     │
    │     └─ 응답: MusicRecommendation[]
    │        (SidePanel 검색/필터용)
    │
    └─ useQuery(recommendationKeys.workedSongIds())
       └─ getWorkedSongIds()
          │
          ├─ supabase.auth.getUser() → user_id 획득
          │
          └─ Supabase: SELECT recommendation_id FROM worked_songs
             WHERE user_id = current_user_id
          │
          └─ 응답: Set<string> (추천곡 ID)

페이지 렌더링
    │
    ├─ RecommendCard (오늘의 추천곡)
    │  │
    │  ├─ MusicRecommendation 표시
    │  │  ├─ 곡명, 작곡가
    │  │  ├─ 영문명
    │  │  ├─ 카테고리
    │  │  └─ YouTube 링크
    │  │
    │  └─ "작업 완료" 체크박스
    │     │
    │     └─ isWorked = workedSongIds.has(recommendationId)
    │        │
    │        └─ 체크박스 상태 제어
    │
    └─ SidePanel (최근/검색)
       │
       ├─ 최근 추천곡 탭
       │  └─ getRecentRecommendations(30) 결과 표시
       │
       └─ 검색 탭
          │
          ├─ 입력 필터링 (getAllRecommendations)
          │  └─ title ILIKE query
          │
          └─ 검색 결과 클릭 → RecommendCard 변경

사용자 "작업 완료" 토글
    │
    └─ onChange 핸들러
       │
       ├─ isWorked가 false인 경우:
       │  │
       │  └─ useMarkAsWorked() 뮤테이션
       │     │
       │     ├─ supabase.auth.getUser() → user_id
       │     │
       │     └─ Supabase: INSERT INTO worked_songs
       │        (user_id, recommendation_id)
       │        VALUES (user_id, recommendationId)
       │     │
       │     └─ onSuccess:
       │        └─ queryClient.invalidateQueries(
       │             recommendationKeys.workedSongIds()
       │           )
       │           → workedSongIds 재조회
       │           → RecommendCard 체크박스 상태 업데이트
       │
       └─ isWorked가 true인 경우:
          │
          └─ useUnmarkAsWorked() 뮤테이션
             │
             ├─ supabase.auth.getUser() → user_id
             │
             └─ Supabase: DELETE FROM worked_songs
                WHERE user_id = user_id
                AND recommendation_id = recommendationId
             │
             └─ onSuccess:
                └─ queryClient.invalidateQueries(
                     recommendationKeys.workedSongIds()
                   )
                   → 체크박스 해제

성공 시:
 → workedSongIds 자동 갱신
    → RecommendCard 체크박스 상태 동기화

실패 시:
 → onError 콜백
    └─ toast({ title: '작업 상태 저장 실패' })
    └─ 체크박스 상태 복구됨 (이전 상태로)
```

### 데이터 구조

```typescript
type MusicRecommendation = {
  id: string;
  recommended_date: string;      // "2025-03-05"
  title: string;                 // 곡명
  composer: string;              // 작곡가
  english_title?: string;
  category?: string;             // 'CLASSIC', 'POP' 등
  youtube_query?: string;        // 검색 키워드
  notes?: string;
}

type WorkedSongRecord = {
  id: string;                    // UUID
  user_id: string;               // Supabase Auth user ID
  recommendation_id: string;     // MusicRecommendation.id
  completed_at: string;          // ISO 8601
}
```

---

## 6. React Query 생명 주기

```
┌──────────────────────────────────────────────────────────┐
│             React Query 상태 머신                        │
└──────────────────────────────────────────────────────────┘

useQuery(queryKey, queryFn)
    │
    ├─ 초기 상태
    │  ├─ status: 'pending'
    │  ├─ isPending: true
    │  ├─ data: undefined
    │  └─ error: undefined
    │
    ├─ 데이터 페칭 중
    │  └─ queryFn() 실행
    │
    ├─ 성공
    │  ├─ status: 'success'
    │  ├─ isPending: false
    │  ├─ data: T (응답 데이터)
    │  ├─ error: undefined
    │  └─ dataUpdatedAt: timestamp
    │     (staleTime 타이머 시작)
    │
    ├─ Fresh 상태 (staleTime 내)
    │  └─ 5분 내 재요청 시 캐시 사용
    │     (queryFn() 실행 안 함)
    │
    ├─ Stale 상태 (staleTime 경과)
    │  └─ 5분 후 재요청 시 즉시 캐시 반환
    │     + 백그라운드에서 queryFn() 실행
    │     (isFetching: true, data 유지)
    │
    ├─ 백그라운드 리페칭
    │  ├─ isFetching: true
    │  ├─ isPending: false (data 있음)
    │  └─ data: 이전 데이터 유지
    │     (UI 깜빡임 없음)
    │
    ├─ 리페칭 완료
    │  └─ 새 데이터로 자동 업데이트
    │     → 컴포넌트 리렌더
    │
    ├─ 실패 (에러)
    │  ├─ status: 'error'
    │  ├─ isPending: false
    │  ├─ data: 이전 데이터 (있으면) 또는 undefined
    │  ├─ error: Error 객체
    │  └─ isError: true
    │
    ├─ 재시도 (retry: 2)
    │  ├─ 1차 실패 후 1초 대기
    │  ├─ 2차 시도 (1초 후)
    │  ├─ 2차 실패 후 2초 대기
    │  ├─ 3차 시도 (2초 후)
    │  └─ 3차 실패 → 에러 상태
    │     (exponential backoff)
    │
    └─ 가비지 컬렉션 (gcTime = 10분)
       └─ 10분 동안 미사용 데이터 메모리 해제
          (컴포넌트 언마운트 후)

invalidateQueries 트리거
    │
    └─ queryClient.invalidateQueries({ queryKey })
       │
       ├─ 해당 쿼리 상태 → stale로 표시
       ├─ 마운트된 컴포넌트 존재 시:
       │  └─ 즉시 백그라운드 리페칭 시작
       └─ 마운트된 컴포넌트 없으면:
          └─ 지연 (다음 마운트 시 fetch)

useMutation 상태 머신
    │
    ├─ 초기 상태
    │  └─ isPending: false
    │
    ├─ mutate() 호출
    │  ├─ isPending: true
    │  ├─ mutationFn() 실행
    │
    ├─ 성공
    │  ├─ isPending: false
    │  ├─ data: T (응답)
    │  └─ onSuccess 콜백 실행
    │     (보통 invalidateQueries 호출)
    │
    └─ 실패
       ├─ isPending: false
       ├─ error: Error 객체
       └─ onError 콜백 실행
          (보통 toast 표시)

낙관적 업데이트 (Optimistic Update)
    │
    ├─ mutate() 호출
    │  └─ onMutate 콜백 (mutation 전)
    │     ├─ 이전 데이터 백업
    │     └─ UI에 새 데이터 즉시 반영
    │
    ├─ mutation 성공
    │  └─ 백업 무시, 서버 응답 사용
    │
    └─ mutation 실패
       └─ onError 콜백
          └─ 백업 데이터로 UI 롤백
          └─ toast 에러 메시지 표시
```

---

## 7. 상태 관리 패턴

### Context API (클라이언트 상태)

```
AuthContext
├─ session: Session | null
├─ loading: boolean
├─ isGuest: boolean
├─ enterGuestMode()
└─ exitGuestMode()

ThemeContext
├─ isDark: boolean
└─ toggleTheme()

(사용처)
├─ ProtectedRoute - session 체크
├─ AppLayout - 사용자 메뉴 표시
└─ 모든 컴포넌트 - isDark로 스타일 결정
```

### React Query (서버 상태)

```
QueryClient
├─ defaultOptions
│  ├─ queries:
│  │  ├─ staleTime: 5분
│  │  ├─ gcTime: 10분
│  │  ├─ retry: 2회
│  │  └─ retryDelay: exponential
│  └─ mutations:
│     └─ retry: 0
│
└─ 쿼리 캐시
   ├─ commissionKeys.*
   ├─ scoreKeys.*
   ├─ statsKeys.*
   ├─ recommendationKeys.*
   └─ ...

(사용처)
├─ useQuery(queryKey, queryFn)
├─ useMutation(mutationFn)
└─ useQueryClient().invalidateQueries()
```

### 폼 상태 (React Hook Form)

```
useForm({
  resolver: zodResolver(schema),
  defaultValues: {...}
})

├─ watch()     - 폼 값 구독
├─ handleSubmit() - 폼 제출
├─ reset()     - 폼 초기화
├─ formState.errors - 에러 메시지
└─ control     - Zod 통합
```

---

## 8. 오류 처리 및 복구 전략

```
┌─────────────────────────────────────────┐
│     에러 처리 계층 구조                 │
└─────────────────────────────────────────┘

L1 Global Error Boundary
└─ 예상치 못한 렌더링 에러
   ├─ 스택 트레이스 로깅
   └─ 새로고침 버튼 제공

L2 Page Error Boundary
└─ 페이지 수준 에러
   ├─ 해당 페이지만 격리
   └─ 다른 페이지 정상 동작

L3 Section Error Boundary
└─ 섹션/컴포넌트 수준
   ├─ Dashboard 카드 중 1개 실패
   └─ 다른 카드는 정상 표시

useQuery 에러
├─ isError: true
├─ data: 캐시 데이터 (있으면)
└─ 폴백 UI 표시 + 재시도 버튼

useMutation 에러
├─ error.message 표시
└─ onError 콜백 → toast 알림

네트워크 에러
├─ Supabase 응답 없음
├─ 자동 재시도 (exponential backoff)
└─ 최종 실패 시 오프라인 안내

Edge Function 에러
├─ 응답: { data: null, error: {...} }
└─ analyzeCommissionImage 실패
   → toast 에러 메시지
   → 사용자 재시도 가능
```

이 문서는 Blueberry 데이터 흐름의 핵심 경로를 다룹니다.
추가 흐름은 개별 모듈의 queryKeys.ts 와 mutations.ts 참고.
