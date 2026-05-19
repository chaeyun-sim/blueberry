# 요구사항 분석

## 기능 요구사항 (Functional)

### P0 — 핵심 기능

| # | 기능 |
|---|------|
| F-01 | 의뢰 CRUD (곡명·작곡가·편성·버전·마감일·메모) |
| F-02 | 의뢰 상태 변경 — 대기 → 작업중 → 완료 / 취소 |
| F-03 | 악보 카탈로그 — 곡(Song) + 편성(Arrangement) 계층 관리 |
| F-04 | 편성별 파일 업로드·다운로드 (악보·음원) |
| F-05 | 대시보드 — 진행 중 의뢰·마감 임박·월별 매출 위젯 |
| F-06 | 캘린더 — 마감 기한 이벤트, 월/주/일 뷰 |
| F-07 | 매출 통계 — Excel 파일 업로드 → 월별/카테고리별/상위 곡 차트 |

### P1 — 주요 차별 기능

| # | 기능 |
|---|------|
| F-08 | AI 자동 파싱 — 카카오톡 스크린샷 업로드 → 의뢰 정보(곡명·편성·마감) 자동 추출 |
| F-09 | 파일 관리 페이지 — 악보 ZIP 업로드·편성 자동 매핑 |
| F-10 | 음악 추천 — Soundpost 연동 편곡 현황 조회 |

### P2 — 부가 기능

| # | 기능 |
|---|------|
| F-11 | 의뢰 납품 여부 플래그 (`is_delivered`) |
| F-12 | 의뢰별 내부 메모 (`notes`) |
| F-13 | Excel 업로드 상세 조회 (곡별 판매 내역 확인) |
| F-14 | 설정 페이지 (비밀번호 변경 등) |
| F-15 | 마감 푸시 알림 (오전 10시·오후 3시·오후 9시 세분화) |

---

## 비기능 요구사항 (Non-Functional)

| # | 항목 | 내용 |
|---|------|------|
| NF-01 | 인증 | Supabase Auth (이메일/패스워드) + ProtectedRoute |
| NF-02 | 데이터 격리 | Supabase RLS — 사용자별 데이터 완전 격리 |
| NF-03 | 파일 보안 | Storage 버킷 비공개, 서명된 URL로만 접근 |
| NF-04 | 반응형 | 웹·모바일·태블릿 대응 |
| NF-05 | 파일 형식 | PDF, MP3, WAV, MIDI, ZIP 허용 |
| NF-06 | 유효성 검증 | 클라이언트(Zod) + Supabase constraint 양측 검증 |
| NF-07 | 성능 모니터링 | Vercel Analytics + Speed Insights |
| NF-08 | 커밋 컨벤션 | Conventional Commits (commitlint + husky) |

---

## 의뢰 상태 흐름

```
대기(received) → 작업중(working) → 완료(complete)
                               ↘ 취소(cancelled)
```

> 상태 설정은 `src/constants/status-config.ts` 에서 관리.

---

## 악보 카탈로그 계층

```
Song (곡)
  └─ Arrangement (편성, 예: "Piano Solo", "String Quartet")
       └─ ArrangementFile (악보·음원 파일)
```

- 의뢰(`Commission`)는 특정 편성 완성 후 `song_id`로 곡과 연결될 수 있음
- 편성은 `commission_id`로 원본 의뢰와 연결 가능
