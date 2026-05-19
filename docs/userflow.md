# 사용자 흐름 (User Flow)

편곡가(1인 사용자) 기준의 주요 사용 시나리오.

---

## 1. 회원가입 / 로그인

```
앱 진입
  └─ 미인증 → /login
       ├─ 이메일/패스워드 로그인 → 대시보드(/)
       └─ 계정 없음 → /register → 가입 완료 → 대시보드(/)
```

---

## 2. 의뢰 등록 (주요 플로우)

```
대시보드 또는 사이드바
  └─ "+ 새 의뢰" 버튼 → /new

/new (CommissionRegister)
  ├─ [방법 A] 직접 입력
  │    곡명 · 작곡가 · 편성 · 버전 · 마감일 · 메모 입력
  │    → 저장 → /commissions/:id (상세)
  │
  └─ [방법 B] AI 자동 파싱
       카카오톡 스크린샷 업로드
       → AI가 곡명 · 편성 · 마감 추출
       → 폼 자동완성 (불확실 값 하이라이트)
       → 사용자 확인/수정
       → 저장 → /commissions/:id (상세)
```

---

## 3. 의뢰 진행 관리

```
/commissions (목록)
  └─ 의뢰 카드 클릭 → /commissions/:id (상세)

/commissions/:id
  ├─ 상태 변경 드롭다운
  │    대기 → 작업중 → 완료
  │                  ↘ 취소
  ├─ 납품 완료 체크 (is_delivered 토글)
  └─ 수정 버튼 → /commissions/:id/edit
```

---

## 4. 악보 카탈로그 등록

```
/scores/new (ScoreRegister)
  곡 정보 입력 (제목 · 영문 제목 · 작곡가 · 카테고리)
  편성 추가 (악기 구성 · 버전)
  └─ 파일 첨부
       ├─ [방법 A] 개별 파일 업로드 (PDF / MP3 / WAV)
       └─ [방법 B] ZIP 업로드 → 편성 자동 매핑

  → 저장 → /scores/:scoreId/arrangements/:arrangementId (편성 상세)
```

---

## 5. 편성 파일 관리

```
/scores/:scoreId/arrangements/:arrangementId
  └─ 파일 목록 확인
       ├─ 파일 다운로드
       ├─ 파일 추가 업로드
       └─ 파일 삭제
```

---

## 6. 파일 일괄 관리 (`/files`)

```
/files (Files)
  └─ ZIP 드래그 앤 드롭
       → 내부 파일 파싱
       → 편성 자동 매핑 제안
       → 확인 후 업로드
```

---

## 7. 매출 통계 확인

```
사이드바 → 매출 통계 → /stats

/stats (SalesStats)
  ├─ Excel 업로드 버튼
  │    판매 보고서 Excel 선택 → 파싱 → 저장
  │    → 업로드 완료 → 통계 갱신
  │
  ├─ 통계 차트 조회
  │    월별 매출 · 카테고리 분포 · 상위 곡 · 트렌딩
  │
  └─ 업로드 이력 클릭 → /files/excel/:uploadId
       곡별 상세 판매 내역 조회
```

---

## 8. 캘린더로 일정 확인

```
사이드바 → 캘린더 → /calendar

/calendar
  └─ 마감일 이벤트 클릭 → /commissions/:id (상세)
```

---

## 9. 대시보드 한눈에 보기

```
/ (대시보드)
  ├─ 진행 중인 의뢰 위젯 → 클릭 → /commissions/:id
  ├─ 마감 임박 위젯 → 클릭 → /commissions/:id
  ├─ 상태 도넛 차트
  ├─ 월별 매출 차트
  └─ Discover 위젯 → 악보 카탈로그 탐색
```

---

## 10. 설정

```
사이드바 하단 → 설정 → /settings
  └─ 비밀번호 변경
```
