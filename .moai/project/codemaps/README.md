# Blueberry 아키텍처 코드맵 (Architecture Codemaps)

이 디렉토리는 Blueberry 프로젝트의 아키텍처 문서를 체계적으로 정리한 코드맵 모음입니다.

## 파일 구성

### 1. overview.md (294줄)
**고수준 아키텍처 개요**

- 시스템 아키텍처 다이어그램 (UI → State → API → Backend)
- 레이어 구조 설명 (UI, State, API, Backend)
- 설계 패턴 (Query Keys Factory, Soft Delete, Error Boundary)
- 주요 데이터 흐름 요약
- 성능 최적화 전략 (5가지)
- 보안 & 배포 정보

**대상**: 아키텍처 이해가 필요한 신규 팀원

---

### 2. modules.md (397줄)
**모듈별 책임 및 인터페이스**

- 모듈 일람표 (6개 도메인 모듈)
- Commission 모듈 (의뢰 CRUD, 상태관리, AI 분석)
- Score 모듈 (곡/편성 관리, 파일 업로드)
- Stats 모듈 (매출 통계, Excel 임포트)
- Recommendation 모듈 (일일 추천곡, 작업 추적)
- Auth 모듈 (인증)
- UI Primitives (shadcn/ui 컴포넌트들)
- Pages 레이어 (15개 라우트)
- 컴포넌트 상세 (페이지별 서브컴포넌트)

**대상**: 특정 모듈 개발이 필요할 때

---

### 3. dependencies.md (388줄)
**의존성 그래프 & 외부 패키지**

- 모듈 간 의존성 그래프 (Pages → API → Utils → Supabase)
- 내부 모듈 의존성 세부 분석
- 외부 패키지 목록 (React, TanStack Query, Supabase, shadcn/ui 등)
- 백엔드 의존성 (Supabase, Edge Functions, 외부 API)
- 환경 변수 & 런타임 API 요구사항
- 순환 의존성 점검
- 성능/보안 관련 의존성
- 마이그레이션 가능 대체 패키지

**대상**: 패키지 업그레이드, 아키텍처 리팩토링

---

### 4. entry-points.md (562줄)
**애플리케이션 진입점 & 라우팅**

- 애플리케이션 진입점 (main.tsx, App.tsx, QueryClient, Supabase)
- 라우팅 구조 (16개 라우트)
- 인증 & 보호 (ProtectedRoute, AuthProvider)
- 지연 로딩 맵 (15개 페이지의 Lazy Loading)
- 페이지별 데이터 로딩 흐름 (7개 주요 페이지)
- 폼 진입점 (CommissionRegisterForm, ScoreRegisterForm)
- 모달 & 오버레이 진입점 (8개)
- 메인 네비게이션 (AppLayout)
- 캐시 무효화 진입점 (invalidateQueries)
- 에러 처리 진입점 (3계층 ErrorBoundary)
- 상태 초기화 진입점
- 환경별 설정

**대상**: 라우팅 추가, UI 플로우 이해, 진입점 수정

---

### 5. data-flow.md (994줄)
**핵심 기능별 데이터 흐름**

- 1. 의뢰 생성 흐름 (폼 입력 → 저장 → Edge Function)
- 2. 악보 조회 및 파일 관리 (파일 업로드/삭제)
- 3. 매출 통계 조회 (8개 병렬 쿼리, 클라이언트 집계)
- 4. Excel 매출 데이터 임포트 (파싱 → 룩업 → 청크 insert)
- 5. 추천곡 작업 완료 추적 (작업 상태 토글)
- 6. React Query 생명 주기 (상태 머신)
- 7. 상태 관리 패턴 (Context API vs React Query)
- 8. 오류 처리 및 복구 전략

**대상**: 기능 개발, 데이터 흐름 이해, 버그 디버깅

---

## 사용 가이드

### 신규 팀원 온보딩
1. **overview.md** 읽기 - 전체 아키텍처 이해
2. **entry-points.md** 읽기 - 라우팅 & 진입점 이해
3. **modules.md** 읽기 - 각 도메인 역할 이해

### 기능 개발
1. **modules.md** 에서 해당 모듈 찾기
2. **data-flow.md** 에서 해당 기능의 흐름 확인
3. **dependencies.md** 에서 의존성 확인
4. 코드 작성 및 테스트

### 버그 디버깅
1. **data-flow.md** 에서 에러 발생 위치의 흐름 확인
2. **entry-points.md** 에서 에러 처리 방식 확인
3. 로그 레벨 확인 (L1, L2, L3 ErrorBoundary)

### 성능 최적화
1. **overview.md** 의 성능 최적화 전략 검토
2. **dependencies.md** 의 성능 관련 의존성 확인
3. **data-flow.md** 의 React Query 생명 주기 검토

### 패키지 업그레이드
1. **dependencies.md** 의 외부 패키지 목록 확인
2. **modules.md** 에서 영향받는 모듈 확인
3. 테스트 계획 수립

---

## 핵심 개념 빠른 참고

### QueryKeys 팩토리 패턴
```typescript
// src/api/commission/queryKeys.ts
commissionKeys.all              // ['commissions']
commissionKeys.list()           // ['commissions', 'list']
commissionKeys.detail(id)       // ['commissions', 'detail', id]
commissionKeys.monthlyCounts()  // ['commissions', 'monthlyCounts']
```

### Soft Delete 패턴
```typescript
// 조회: deleted_at IS NULL
// 삭제: UPDATE ... SET deleted_at = now()
```

### 에러 바운더리 계층
- **L1 (Global)**: 렌더링 에러, 스택 트레이스
- **L2 (Page)**: 페이지별 격리
- **L3 (Section)**: 섹션별 독립 처리

### React Query 캐시 정책
- staleTime: 5분 (재페칭 50-70% 감소)
- gcTime: 10분 (가비지 컬렉션)
- retry: 2회 (exponential backoff)

---

## 파일 통계

| 파일 | 줄 수 | 크기 |
|------|-------|------|
| overview.md | 294 | 12KB |
| modules.md | 397 | 13KB |
| dependencies.md | 388 | 11KB |
| entry-points.md | 562 | 14KB |
| data-flow.md | 994 | 31KB |
| **합계** | **2,635** | **81KB** |

---

## 최종 업데이트 정보

- **생성일**: 2026-03-05
- **언어**: 한국어
- **형식**: Markdown
- **대상**: Blueberry v1.0+ 아키텍처

---

## 관련 링크

- 프로젝트 구조: `/Users/chaeyunsim/Documents/blueberry`
- API 모듈: `src/api/`
- 페이지: `src/pages/`
- 컴포넌트: `src/components/`
- 유틸: `src/utils/`, `src/lib/`

---

이 코드맵은 Blueberry 프로젝트의 아키텍처를 이해하고 개발할 때 참고자료로 사용되도록 설계되었습니다.
