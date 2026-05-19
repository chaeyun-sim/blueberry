# 기술 스택

## 핵심 스택

| 패키지 | 버전 | 역할 |
|--------|------|------|
| React | 18.3 | UI 렌더링 |
| Vite | 5 | 번들러 / 개발 서버 |
| TypeScript | 5.8 | 타입 안전성 |
| TailwindCSS | v3 | 유틸리티 기반 스타일링 |
| shadcn/ui | latest | Radix UI 기반 컴포넌트 라이브러리 |
| TanStack Query | v5 | 서버 상태 관리 (API 캐싱·동기화) |
| Supabase | v2 | Auth + PostgreSQL DB + Storage |

---

## 추가 패키지

| 패키지 | 역할 |
|--------|------|
| `react-router-dom` v6 | 페이지 라우팅 |
| `react-hook-form` | 폼 상태 관리 |
| `zod` | 스키마 기반 유효성 검증 |
| `@hookform/resolvers` | react-hook-form ↔ zod 연결 |
| `overlay-kit` | 오버레이(모달·드로어) 명령형 제어 |
| `framer-motion` | 애니메이션 |
| `recharts` | 매출 차트 (월별/카테고리별) |
| `react-day-picker` | 달력 날짜 선택 UI |
| `date-fns` | 날짜 파싱·포맷·연산 |
| `dayjs` | 날짜 포맷·연산 (대시보드 시계 등) |
| `xlsx` | Excel 파일 파싱 (판매 보고서 업로드) |
| `jszip` | ZIP 파일 압축/해제 (악보 파일 일괄 처리) |
| `lucide-react` | 아이콘 |
| `clsx` + `tailwind-merge` | Tailwind 클래스 조건부 조합 (`cn()` 유틸) |
| `sonner` | 토스트 알림 |
| `next-themes` | 테마 시스템 기반 |
| `cmdk` | 커맨드 팔레트 |
| `embla-carousel-react` | 캐러셀 |

---

## 개발 의존성

| 패키지 | 역할 |
|--------|------|
| `vitest` | 단위 테스트 |
| `@testing-library/react` | React 컴포넌트 테스트 |
| `husky` | Git 훅 (pre-commit) |
| `commitlint` | 커밋 메시지 컨벤션 검증 |
| `eslint` v9 | 린팅 |
| `@vitejs/plugin-react-swc` | React Fast Refresh (SWC) |
| `@types/node` | Node.js 타입 (vite.config.ts 경로 alias) |
| `lovable-tagger` | Lovable 플랫폼 연동 태거 |

---

## 모니터링

| 패키지 | 역할 |
|--------|------|
| `@vercel/analytics` | 페이지뷰 분석 |
| `@vercel/speed-insights` | 성능 측정 |

---

## 설치 명령어

```bash
npm install
```

---

## 주요 설정

### 경로 alias

`@/` → `src/` 로 매핑 (`vite.config.ts` + `tsconfig.app.json`)

```ts
import { cn } from '@/lib/utils'
```

### TailwindCSS v3

`tailwind.config.ts` + CSS 변수 기반 커스텀 토큰.  
shadcn/ui 컴포넌트와 함께 사용하며 `src/index.css`에 CSS 변수 정의.

### TanStack Query 기본값

`staleTime`, `retry: 1` — `src/utils/query-client.ts`

### Supabase

- `src/utils/supabase.ts` — 클라이언트 싱글톤
- Auth: 이메일/패스워드 + Session 관리 (`AuthProvider`)
- Storage: 비공개 버킷, 서명된 URL로만 파일 접근
- RLS(Row Level Security): 사용자별 데이터 격리

### 폴더 구조

[아키텍처 문서](./architecture.md) 참고
