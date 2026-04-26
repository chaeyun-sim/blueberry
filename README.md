# 🫐 blueberry

> 편곡 작업자를 위한 의뢰 & 악보 관리 서비스

프리랜서 편곡가가 의뢰 접수부터 납품까지의 워크플로우를 한 곳에서 관리할 수 있도록 만든 개인용 업무 관리 도구입니다.
의뢰 상태 추적, 악보 보관, 매출 통계, 편곡 추천까지 작업에 필요한 기능을 통합하여 제공합니다.

### 기능 소개

|     | 기능      | 설명                                                                         |
| --- | --------- | ---------------------------------------------------------------------------- |
| 🏠  | 대시보드  | 진행 중인 의뢰 현황, 매출 요약, 월별 차트를 한눈에 확인                      |
| 📋  | 의뢰 관리 | 악보 이미지 AI 분석으로 자동 입력, **대기 → 작업중 → 완료 → 전달** 상태 추적 |
| 🎵  | 악보 관리 | 곡 단위로 악보 등록·분류, 파일 업로드 및 ZIP 다운로드                        |
| 💰  | 매출 통계 | 월별·연간 매출 차트 시각화, Excel 업로드로 데이터 일괄 등록                  |
| 📅  | 캘린더    | 의뢰 마감일 기반 월별 일정 뷰                                                |
| 📁  | 파일 관리 | 업로드된 악보 파일 열람 및 ZIP 일괄 다운로드                                 |

### 기술 스택

| 분류          | 기술                               |
| ------------- | ---------------------------------- |
| Frontend      | React 18, TypeScript, Vite         |
| Styling       | Tailwind CSS, shadcn/ui (Radix UI) |
| Data Fetching | TanStack Query v5                  |
| Backend / DB  | Supabase                           |
| Charts        | Recharts                           |
| Animation     | Framer Motion                      |
| Routing       | React Router DOM v6                |
| Deployment    | Vercel                             |

### 디렉토리 구조

```
src/
├── api/              # Supabase 쿼리 & 뮤테이션 (domain별 분리)
│   ├── commission/
│   ├── score/
│   ├── stats/
│   └── recommendation/
├── components/       # 재사용 컴포넌트
│   ├── layout/       # AppLayout, PageHeader 등
│   ├── pages/        # 페이지별 하위 컴포넌트
│   └── ui/           # shadcn/ui 기반 공통 컴포넌트
├── constants/        # 상태 설정, 악기 목록 등 상수
├── hooks/            # 커스텀 훅
├── pages/            # 라우팅 단위 페이지 컴포넌트
├── provider/         # AuthProvider 등 Context
├── types/            # TypeScript 타입 정의
└── utils/            # 유틸 함수
```
