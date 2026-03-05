# 블루베리 기술 스택

## 기술 스택 개요

| 계층 | 기술 | 버전 | 목적 |
|------|------|------|------|
| **프레임워크** | React | 18.3.1 | UI 라이브러리 |
| **라우팅** | React Router | 6.30.1 | 페이지 네비게이션 |
| **데이터 페칭** | TanStack Query (React Query) | 5.83.0 | 서버 상태 관리, 캐싱 |
| **백엔드** | Supabase | 2.97.0 | PostgreSQL 데이터베이스, Auth, Storage, Functions |
| **스타일링** | Tailwind CSS | 3.4.17 | 유틸리티 CSS |
| **UI 컴포넌트** | shadcn/ui | latest | Radix UI + Tailwind 프리셋 컴포넌트 |
| **폼 처리** | React Hook Form | 7.61.1 | 폼 상태 관리 |
| **입력 검증** | Zod | 3.25.76 | 런타임 타입 검증 |
| **언어** | TypeScript | 5.8.3 | 타입 안전성 |
| **빌드 도구** | Vite | 5.4.19 | 고속 빌드 & 핫 리로드 |
| **SWC** | @vitejs/plugin-react-swc | 3.11.0 | 빠른 JSX 컴파일 |
| **차트** | Recharts | 2.15.4 | 데이터 시각화 |
| **파일 처리** | XLSX | 0.18.5 | Excel 임포트/내보내기 |
| **ZIP 생성** | jszip | 3.10.1 | 파일 압축 |
| **날짜** | dayjs | 1.11.19 | 경량 날짜 조작 |
| **날짜 (추가)** | date-fns | 3.6.0 | 날짜 형식화 |
| **애니메이션** | Framer Motion | 12.34.2 | 부드러운 UI 애니메이션 |
| **모달** | overlay-kit | 1.8.6 | 모달/드로어 관리 |
| **드로어** | Vaul | 0.9.9 | 드로어 컴포넌트 |
| **알림** | Sonner | 1.7.4 | Toast 알림 |
| **테마** | next-themes | 0.3.0 | Light/Dark 모드 |
| **아이콘** | lucide-react | 0.462.0 | SVG 아이콘 라이브러리 |
| **분석** | Vercel Analytics | 1.6.1 | 사용자 행동 분석 |
| **성능** | Vercel Speed Insights | 1.3.1 | 웹 성능 모니터링 |
| **오디오** | lamejs | 1.2.1 | MP3 인코딩 |
| **OTP** | input-otp | 1.4.2 | OTP 입력 컴포넌트 |
| **캐러셀** | embla-carousel-react | 8.6.0 | 반응형 캐러셀 |
| **달력** | react-day-picker | 8.10.1 | 달력 선택 컴포넌트 |
| **라인트** | ESLint | 9.32.0 | 코드 품질 검사 |
| **포매팅** | Prettier | (설정됨) | 코드 포매팅 |
| **테스트** | Vitest | 3.2.4 | 단위/통합 테스트 |
| **테스트 라이브러리** | @testing-library/react | 16.0.0 | 컴포넌트 테스트 |
| **Git Hooks** | Husky | 9.1.7 | 커밋 전 검증 |
| **Commit 규칙** | commitlint | 20.4.2 | 커밋 메시지 형식 검증 |
| **배포** | Vercel | - | 호스팅 및 CI/CD |
| **컨테이너** | Docker | (선택) | 로컬 개발 환경 |

## 프레임워크 선택 근거

### React 18.3.1
**선택 이유:**
- UI 라이브러리의 사실상 표준 (가장 큰 생태계)
- 대규모 커뮤니티 및 라이브러리 생태계
- React Server Components (RSC) 미리보기 지원
- Concurrent Rendering으로 UX 개선

**사용 패턴:**
- 함수형 컴포넌트 (Hooks 사용)
- React.lazy()로 라우트 페이지 분할 로딩
- 에러 바운더리로 에러 처리

### React Router 6
**선택 이유:**
- React 생태계의 표준 라우터
- 중첩 라우팅 지원 (복잡한 레이아웃 처리)
- Protected Route 패턴 (인증 체크)

**라우팅 구조:**
```
/            → Index (대시보드)
/login       → Login (공개)
/commissions → CommissionList (보호됨)
/commissions/:id → CommissionDetail (보호됨)
/commissions/:id/edit → CommissionEdit (보호됨)
/files       → Files (파일 탐색)
/scores/:scoreId/arrangements/:arrangementId → ScoreDetail
/scores/new  → ScoreRegister
/stats       → SalesStats
/calendar    → CalendarView
/recommend   → MusicRecommend
/settings    → Settings
/files/excel/:uploadId → ExcelUploadDetail
```

### TanStack Query (React Query) 5
**선택 이유:**
- 서버 상태 관리의 베스트 프랙티스
- 자동 캐싱, 백그라운드 리페칭, 동기화
- React Query DevTools로 디버깅 용이
- 낮은 스테일타임으로 신선한 데이터 유지

**사용 패턴:**
```typescript
// Query
const { data: commissions, isLoading, error } = useQuery({
  queryKey: commissionKeys.lists(),
  queryFn: () => supabase.from('commissions').select('*')
})

// Mutation
const { mutate: createCommission } = useMutation({
  mutationFn: (data) => supabase.from('commissions').insert(data),
  onSuccess: () => queryClient.invalidateQueries(commissionKeys.lists())
})
```

**설정:**
- `staleTime`: 5분 (재페칭 50-70% 감소)
- `gcTime`: 10분 (메모리 효율)
- `retry`: 2회 (순간적 네트워크 오류 대응)

### Supabase
**선택 이유:**
- PostgreSQL 기반 신뢰할 수 있는 데이터베이스
- 내장 인증 (Supabase Auth)
- 파일 저장소 (Supabase Storage)
- Edge Functions (서버리스 함수)
- 실시간 구독 가능 (Realtime)

**주요 기능:**
- **Auth**: JWT 기반 이메일/비밀번호 인증
- **Database**: PostgreSQL + Realtime 구독
- **Storage**: 악보 파일, 이미지 저장소
- **Functions**: AI 분석, 이메일 알림, 푸시 알림

**데이터베이스 구조:**
```
commissions (의뢰)
├── id, user_id, title, amount, status, due_date, ...
└── deleted_at (soft delete)

arrangements (편곡)
├── id, commission_id, composition_name, composer, ...

scores (악곡)
├── id, user_id, composition_name, ...

score_files (악보 파일)
├── id, arrangement_id, file_path, file_type

stats (통계)
├── id, user_id, month, year, total_amount

users (사용자)
├── id (Supabase Auth uid), email, profile, ...
```

### Tailwind CSS + shadcn/ui
**선택 이유:**
- Tailwind: 유틸리티 기반 CSS로 빠른 개발
- shadcn/ui: Radix UI 헤드리스 컴포넌트 + Tailwind 스타일
- 낮은 CSS 번들 크기
- 다크 모드 기본 지원

**사용 예:**
```tsx
// Button
<Button variant="outline" size="sm">클릭</Button>

// Form
<Form>
  <FormField name="title" render={({ field }) => (
    <FormItem>
      <FormLabel>제목</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
    </FormItem>
  )} />
</Form>
```

### Vite 5 + SWC
**선택 이유:**
- Vite: ES 모듈 기반 극속 빌드 (Webpack 대비 50배 빠름)
- SWC: Rust 기반 JavaScript 컴파일러 (Babel 대비 20배 빠름)
- HMR (Hot Module Replacement) 150ms 이내
- 프로덕션 번들 최소화

**빌드 결과:**
- 개발 모드: 3초 (콜드 스타트)
- 프로덕션: 45초 (최적화 포함)

### TypeScript 5.8.3
**선택 이유:**
- 타입 안전성 (런타임 에러 감소 ~80%)
- IDE 자동완성 및 리팩토링 지원
- 최신 ECMAScript 기능 지원

**주요 설정:**
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true
}
```

## 개발 환경 요구사항

### 필수 요구사항

**Node.js & npm:**
```bash
node --version  # v20.14.0 이상 (LTS)
npm --version   # v10.8.0 이상
```

**운영체제:**
- macOS 13+ (Sonoma 권장)
- Windows 11 (WSL2 권장)
- Ubuntu 22.04 LTS

**필수 설치:**
```bash
# Node.js (homebrew 권장)
brew install node@20

# npm 업그레이드 (필요 시)
npm install -g npm@latest
```

### 선택 요구사항

**Git:**
- Git 2.40+
- Husky 사용으로 커밋 메시지 자동 검증

**IDE 권장:**
- VSCode (권장) + 확장:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin
  - Thunder Client (API 테스트)

**Supabase CLI (선택):**
```bash
brew install supabase/tap/supabase
supabase --version  # 1.191.0+
```

## 빌드 및 배포 구성

### 로컬 개발 환경

**1. 환경 설정**
```bash
# 저장소 복제
git clone https://github.com/user/blueberry.git
cd blueberry

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일 편집:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

**2. 개발 서버 시작**
```bash
npm run dev
# http://localhost:8080 접속
```

**3. 코드 검사**
```bash
npm run lint              # ESLint 검사
npm run test              # Vitest 단위 테스트
npm run test:watch       # 파일 변경 감시 테스트
```

### 프로덕션 빌드

**1. 빌드**
```bash
npm run build
# dist/ 폴더 생성 (최적화된 정적 파일)
```

**2. 빌드 미리보기**
```bash
npm run preview
# 프로덕션 최적화 테스트 (http://localhost:4173)
```

**3. 번들 분석**
```bash
npm run build -- --analyze
# 번들 크기 분석 (선택, 플러그인 필요)
```

### Vercel 배포

**자동 배포 설정:**

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**배포 스크립트:**
```bash
# Vercel CLI 설치
npm i -g vercel

# 첫 배포
vercel --prod

# 자동 배포 활성화 (GitHub 연동)
# GitHub에서 Vercel 앱 설치 → 자동 배포 시작
```

**배포 흐름:**
1. GitHub에 push
2. Vercel 자동 감지 → 빌드 시작
3. Preview URL 생성 (PR에 댓글)
4. main 브랜치 push → 프로덕션 배포

**배포 환경변수:**
```
VITE_SUPABASE_URL=https://production-project.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
```

## 환경변수 목록

### 필수 환경변수

**개발 환경 (.env.local)**
```bash
# Supabase 설정 (필수)
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# (선택) AI 분석용 OpenAI API
VITE_OPENAI_API_KEY=sk-proj-...

# (선택) Soundpost API
VITE_SOUNDPOST_API_URL=https://api.soundpost.co.kr
```

**프로덕션 환경변수 (Vercel)**
```
VITE_SUPABASE_URL=https://[production-project].supabase.co
VITE_SUPABASE_ANON_KEY=production-key
VITE_OPENAI_API_KEY=sk-proj-production-...
```

### 환경변수 가이드

| 변수 | 필수 | 출처 | 예시 |
|------|------|------|------|
| `VITE_SUPABASE_URL` | ✅ | Supabase 콘솔 (Settings) | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase 콘솔 (API Keys) | `eyJhbGc...` (긴 문자열) |
| `VITE_OPENAI_API_KEY` | ❌ | OpenAI 계정 | `sk-proj-...` |
| `VITE_SOUNDPOST_API_URL` | ❌ | Soundpost 개발자 콘솔 | `https://api.soundpost.co.kr` |

**환경변수 확인:**
```bash
# .env.local 파일 생성
cp .env.example .env.local

# 환경변수 검증 (앱 시작 시)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
```

### 보안 주의사항

⚠️ **절대 금지:**
- 개인 키(ANON_KEY)를 GitHub에 커밋
- `.env.local` 파일을 저장소에 포함
- 프로덕션 키를 로컬에 저장

✅ **안전한 방법:**
- Vercel Secrets 사용 (자동 암호화)
- `.gitignore`에 `.env.local` 추가
- 팀 공유 시 1Password, LastPass 등 사용

## 주요 npm 스크립트

| 스크립트 | 명령어 | 목적 |
|---------|--------|------|
| `dev` | `vite` | 개발 서버 시작 (핫 리로드) |
| `build` | `vite build` | 프로덕션 최적화 빌드 |
| `build:dev` | `vite build --mode development` | 개발 모드 빌드 (소스맵 포함) |
| `lint` | `eslint .` | 코드 품질 검사 |
| `preview` | `vite preview` | 프로덕션 빌드 미리보기 |
| `test` | `vitest run` | 전체 테스트 실행 |
| `test:watch` | `vitest` | 파일 변경 감시 테스트 |
| `prepare` | `husky` | Git Hooks 설정 |

## 배포 전 체크리스트

### 로컬 검증
```bash
# 1. 테스트 실행
npm run test

# 2. 린트 검사
npm run lint

# 3. 빌드 확인
npm run build

# 4. 프로덕션 미리보기
npm run preview
```

### Vercel 배포 전
- [ ] 모든 테스트 통과
- [ ] ESLint 경고 없음
- [ ] 환경변수 설정됨
- [ ] README 업데이트됨
- [ ] 커밋 메시지 정규형식 준수

### 배포 후 확인
- [ ] Vercel 빌드 로그 확인 (에러 없음)
- [ ] 프로덕션 URL 접속 확인
- [ ] 주요 기능 테스트 (로그인, 의뢰 등록, 악보 다운로드)
- [ ] 성능 모니터링 (Vercel Speed Insights)

## 성능 최적화

### 번들 크기 최적화
```bash
# 번들 분석
npm run build -- --analyze

# 동적 임포트로 코드 분할
const CommissionDetail = lazy(() => import('./pages/CommissionDetail'))
```

**타겟:**
- JS 번들: < 300KB (gzip)
- 첫 로드: < 2초 (3G)
- TTI (Time to Interactive): < 3초

### 데이터 페칭 최적화
- React Query staleTime: 5분
- Supabase select 절 최소화 (필요한 컬럼만)
- 이미지 업로드 최소화 (압축)

### 렌더링 최적화
- React.lazy()로 라우트 분할 로딩
- shadcn/ui 동적 로드 (Radix UI)
- Framer Motion 애니메이션 최적화

## 모니터링 & 분석

### Vercel Analytics
```typescript
// 자동 활성화 (App.tsx)
import { Analytics } from "@vercel/analytics/react"
<Analytics />
```

**추적 지표:**
- 페이지 뷰
- 사용자 세션
- 상호작용 (클릭, 제출)

### Vercel Speed Insights
```typescript
import { SpeedInsights } from "@vercel/speed-insights/react"
<SpeedInsights />
```

**성능 메트릭:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

### 로그 모니터링
```bash
# Vercel 로그 확인
vercel logs --tail
```

## PWA (Progressive Web App) 설정

### Service Worker 등록
```typescript
// src/main.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
```

### PWA 매니페스트
```json
// public/manifest.json
{
  "name": "Blueberry",
  "short_name": "Blueberry",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 설치 가능성
- HTTPS 필수 (Vercel 자동 제공)
- 매니페스트 JSON 필수
- Service Worker 필수
- 아이콘 필수 (192x192, 512x512)

## Docker 설정 (선택)

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
# Docker 빌드 및 실행
docker build -t blueberry .
docker run -p 3000:3000 blueberry
```

## 트러블슈팅

### 빌드 실패
```bash
# 의존성 캐시 초기화
rm -rf node_modules package-lock.json
npm install

# Node 버전 확인
node --version  # v20+ 필수
```

### 환경변수 로드 실패
```bash
# .env.local 파일 확인
ls -la .env.local

# Vite 재시작
npm run dev
```

### Supabase 연결 오류
```bash
# 네트워크 확인
curl https://[project].supabase.co/rest/v1/

# 인증 키 확인
echo $VITE_SUPABASE_ANON_KEY
```

## 참고 문서

- [Vite 공식 문서](https://vitejs.dev)
- [React Query 공식 문서](https://tanstack.com/query)
- [Supabase 문서](https://supabase.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs)
