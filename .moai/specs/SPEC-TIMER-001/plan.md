---
id: SPEC-TIMER-001
document: plan
version: "1.0.0"
created: 2026-03-05
updated: 2026-03-05
---

# SPEC-TIMER-001 구현 계획

## 구현 접근 방법

기존 `use-live-clock.ts`의 `setInterval + useState` 패턴을 재사용하여 스톱워치 훅을 구성한다. Supabase 연동은 TanStack Query v5의 `useMutation` / `useQuery` 패턴을 따르며, 기존 `src/api/commission/` 구조에 시간 로그 API 레이어를 추가한다. 새로운 npm 의존성은 추가하지 않는다 (dayjs는 이미 사용 중).

---

## 단계별 작업 목록

### Phase 1: 데이터 레이어 (DB + API + 타입)

| 순서 | 작업 | 설명 |
|------|------|------|
| 1-1 | Supabase 마이그레이션 | `commission_time_logs` 테이블 생성, `commissions` 컬럼 추가 |
| 1-2 | 타입 정의 | `src/types/commission.ts`에 `CommissionTimeLog`, `TimerState` 타입 추가 |
| 1-3 | API 레이어 생성 | `src/api/commission/time-logs.ts` 생성 (startSession, stopSession, getLogs) |
| 1-4 | 쿼리 키 추가 | `src/api/commission/queryKeys.ts`에 `timeLogs` 키 추가 |
| 1-5 | 쿼리 훅 추가 | `src/api/commission/queries.ts`에 `useTimeLogsQuery`, `useStopSessionMutation` 추가 |

### Phase 2: 훅 레이어

| 순서 | 작업 | 설명 |
|------|------|------|
| 2-1 | 기본 스톱워치 훅 | `src/hooks/use-stopwatch.ts` 생성 |
| 2-2 | 의뢰 연동 훅 | `src/hooks/use-commission-timer.ts` 생성 |

### Phase 3: UI 레이어

| 순서 | 작업 | 설명 |
|------|------|------|
| 3-1 | 스톱워치 위젯 컴포넌트 | `src/components/pages/commission/StopwatchWidget.tsx` 생성 |
| 3-2 | CommissionDetail 통합 | `src/pages/CommissionDetail.tsx`에 위젯 삽입 |

---

## 기술 상세

### 데이터베이스 스키마

#### 신규 테이블: `commission_time_logs`

```sql
CREATE TABLE commission_time_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  started_at    TIMESTAMPTZ NOT NULL,
  ended_at      TIMESTAMPTZ,
  duration_ms   BIGINT,
  session_notes TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_time_logs_commission_id ON commission_time_logs(commission_id);
CREATE INDEX idx_time_logs_user_id ON commission_time_logs(user_id);

ALTER TABLE commission_time_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own time logs"
  ON commission_time_logs
  FOR ALL USING (auth.uid() = user_id);
```

#### 기존 테이블 변경: `commissions`

```sql
ALTER TABLE commissions
  ADD COLUMN total_time_spent_ms BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN is_timer_active     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN last_timer_start    TIMESTAMPTZ;
```

---

### 훅 인터페이스

#### `use-stopwatch.ts`

```typescript
interface UseStopwatchOptions {
  initialElapsedMs?: number;
  onTick?: (elapsedMs: number) => void;
}

interface UseStopwatchReturn {
  elapsedMs: number;
  isRunning: boolean;
  start: (fromMs?: number) => void;
  stop: () => number; // 반환값: 최종 elapsedMs
  reset: () => void;
  formattedTime: string; // "HH:MM:SS"
}

function useStopwatch(options?: UseStopwatchOptions): UseStopwatchReturn
```

내부 구현: `setInterval(fn, 1000)` + `useRef`로 interval 관리, `useEffect` cleanup으로 메모리 누수 방지.

#### `use-commission-timer.ts`

```typescript
interface UseCommissionTimerOptions {
  commissionId: string;
  commissionStatus: CommissionStatus;
}

interface UseCommissionTimerReturn {
  elapsedMs: number;
  totalSpentMs: number;
  isRunning: boolean;
  isLoading: boolean;
  canStart: boolean; // 상태 기반 계산 (pending | in_progress)
  formattedElapsed: string;
  formattedTotal: string;
  start: () => void;
  stop: () => void;
  timeLogs: CommissionTimeLog[];
}

function useCommissionTimer(options: UseCommissionTimerOptions): UseCommissionTimerReturn
```

내부 동작:
1. 마운트 시 `localStorage` 확인 → 복원 가능하면 `useStopwatch.start(fromMs)` 호출
2. `start()` 호출 시 → localStorage 저장 + Supabase `commission_time_logs`에 `started_at` INSERT (open session)
3. `stop()` 호출 시 → `ended_at`, `duration_ms` UPDATE + `commissions.total_time_spent_ms` 갱신 + localStorage 삭제
4. 의뢰 상태 변경 감지 → `commissionStatus === 'done'` 이면 자동 `stop()` 호출

---

### API 레이어: `time-logs.ts`

```typescript
// 세션 시작 (오픈 레코드 생성)
async function startTimeSession(commissionId: string): Promise<CommissionTimeLog>

// 세션 종료 (ended_at, duration_ms 업데이트)
async function stopTimeSession(logId: string, startedAt: string): Promise<CommissionTimeLog>

// 의뢰별 시간 로그 목록
async function getTimeLogs(commissionId: string): Promise<CommissionTimeLog[]>

// commissions.total_time_spent_ms 재집계
async function recalculateTotalTime(commissionId: string): Promise<void>
```

---

### 컴포넌트 구조: `StopwatchWidget.tsx`

```
StopwatchWidget
├── TimerDisplay          // "HH:MM:SS" 대형 텍스트
├── TimerControls         // 시작 / 정지 버튼
├── TotalTimeDisplay      // "누적: X시간 Y분"
└── TimeLogList (접힘)    // 세션 이력 목록
    └── TimeLogItem[]     // 날짜, 시작-종료, 소요시간
```

shadcn/ui 사용 컴포넌트: `Button`, `Collapsible`, `Tooltip`, `Badge`

---

## 로컬 상태 지속성 전략

```
localStorage key: "blueberry:active-timer"
value: {
  commissionId: string,
  logId: string,       // Supabase 레코드 ID (재연결 시 UPDATE에 사용)
  startedAt: string    // ISO 8601
}
```

복원 로직:
1. 앱 부팅 시 `localStorage` 읽기
2. `commissionId` 유효성 확인 (Supabase 조회)
3. 유효하면 `elapsedMs = Date.now() - new Date(startedAt).getTime()` 계산 후 스톱워치 재개
4. 유효하지 않으면 localStorage 항목 삭제

---

## 파일 변경 목록

### 신규 생성

| 파일 경로 | 설명 |
|-----------|------|
| `src/hooks/use-stopwatch.ts` | 범용 스톱워치 훅 |
| `src/hooks/use-commission-timer.ts` | 의뢰 연동 타이머 훅 |
| `src/api/commission/time-logs.ts` | 시간 로그 Supabase API |
| `src/components/pages/commission/StopwatchWidget.tsx` | 스톱워치 UI 컴포넌트 |
| `supabase/migrations/YYYYMMDD_add_commission_time_logs.sql` | DB 마이그레이션 파일 |

### 수정

| 파일 경로 | 변경 내용 |
|-----------|-----------|
| `src/types/commission.ts` | `CommissionTimeLog`, `TimerState`, `CommissionTimerStatus` 타입 추가 |
| `src/api/commission/queryKeys.ts` | `timeLogs(commissionId)` 쿼리 키 추가 |
| `src/api/commission/queries.ts` | `useTimeLogsQuery`, `useStopSessionMutation` 훅 추가 |
| `src/pages/CommissionDetail.tsx` | 상태 진행바 아래 `<StopwatchWidget>` 삽입 |

---

## 의존성

| 항목 | 내용 |
|------|------|
| 기존 훅 참고 | `src/hooks/use-live-clock.ts` (setInterval 패턴) |
| 날짜 포매팅 | `dayjs` (이미 설치됨) |
| UI 컴포넌트 | shadcn/ui `Button`, `Collapsible`, `Tooltip` (이미 설치됨) |
| 신규 npm 패키지 | 없음 |

---

## 위험 요소 및 대응

| 위험 | 가능성 | 대응 방안 |
|------|--------|----------|
| 새로고침 후 elapsed 시간 오차 | 중간 | `startedAt` 서버 타임스탬프 기준으로 재계산하여 로컬 클록 편차 최소화 |
| 동시 탭에서 같은 타이머 실행 | 낮음 | `localStorage`와 Supabase `is_timer_active` 플래그 이중 체크 |
| 세션 저장 실패 시 데이터 유실 | 중간 | localStorage에 미저장 세션 보관, 다음 진입 시 재시도 UI 제공 |
| setInterval drift (1초 오차 누적) | 낮음 | 매 tick마다 `Date.now() - startedAt` 으로 절대 시간 재계산 |
| `commissions` 컬럼 추가 마이그레이션 롤백 | 낮음 | nullable 컬럼으로 추가, 기존 레코드 호환성 보장 |
