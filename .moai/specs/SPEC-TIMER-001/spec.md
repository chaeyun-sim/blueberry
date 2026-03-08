---
id: SPEC-TIMER-001
version: "1.0.0"
status: draft
created: 2026-03-05
updated: 2026-03-05
author: MoAI
priority: medium
---

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-03-05 | MoAI | 최초 작성 |

---

# SPEC-TIMER-001: 의뢰별 작업 시간 추적 스톱워치

## 개요

### 기능 설명

Blueberry 서비스에 의뢰별 작업 시간을 추적하는 스톱워치 기능을 추가한다. 프리랜서 음악 편곡자는 의뢰 상세 페이지에서 스톱워치를 시작/정지하여 해당 의뢰에 소요된 시간을 누적 기록할 수 있다.

### 도입 동기

- 편곡자는 의뢰별 실제 작업 시간을 파악하기 어려워 견적 산정 시 감에 의존한다.
- 작업 시간 이력이 없으면 생산성 분석 및 단가 산정 근거를 마련할 수 없다.
- 단순한 스톱워치 UI로 최소한의 진입 장벽을 유지하면서 데이터를 축적한다.

### 범위 (Scope)

**포함**
- 의뢰 상세 페이지에서 스톱워치 시작 / 정지
- 세션별 작업 시간 Supabase 저장
- 의뢰별 누적 작업 시간 표시
- 앱 새로고침 후 진행 중인 타이머 상태 복원 (localStorage)
- 의뢰 상태가 `완료`로 전환될 때 타이머 자동 정지

**제외**
- 여러 의뢰의 동시 타이머 실행 (한 번에 1개만 허용)
- 시간 기록 수동 편집
- 타이머 통계 대시보드 (별도 스펙으로 분리)
- 알림 / 리마인더 기능

---

## 요구사항 (EARS 형식)

### REQ-1: 스톱워치 기본 동작

**REQ-1-1**
> **When** 사용자가 의뢰 상세 페이지에서 시작 버튼을 누르면, **the system shall** 스톱워치를 시작하고 경과 시간을 1초 단위로 화면에 표시한다.

**REQ-1-2**
> **When** 사용자가 정지 버튼을 누르면, **the system shall** 스톱워치를 멈추고 현재 세션의 경과 시간을 저장 대기 상태로 전환한다.

**REQ-1-3**
> **While** 스톱워치가 실행 중인 동안, **the system shall** 타이머 UI를 매 1초 이내로 갱신하여 경과 시간(HH:MM:SS)을 표시한다.

**REQ-1-4**
> **If** 다른 의뢰에서 이미 타이머가 실행 중인 상태에서 새로운 타이머 시작이 요청되면, **the system shall** 기존 타이머를 자동 정지 후 저장하고 새로운 타이머를 시작한다.

**REQ-1-5**
> **Where** 스톱워치 위젯이 렌더링되는 곳은, **the system shall** CommissionDetail 페이지의 의뢰 상태 진행바(ProgressBar) 바로 아래에 배치한다.

---

### REQ-2: 시간 기록 저장

**REQ-2-1**
> **When** 사용자가 정지 버튼을 눌러 세션을 종료하면, **the system shall** `commission_time_logs` 테이블에 `started_at`, `ended_at`, `duration_ms`, `commission_id`, `user_id` 를 저장한다.

**REQ-2-2**
> **When** 새로운 세션 기록이 저장되면, **the system shall** 해당 의뢰의 `commissions.total_time_spent_ms` 값을 모든 세션 `duration_ms`의 합산으로 갱신한다.

**REQ-2-3**
> **If** 세션 저장 중 네트워크 오류가 발생하면, **the system shall** 사용자에게 저장 실패 토스트를 표시하고 로컬에 세션 데이터를 유지하여 재시도를 가능하게 한다.

**REQ-2-4**
> **When** 의뢰 상태가 `완료(done)`로 변경되면, **the system shall** 실행 중인 타이머가 있을 경우 자동 정지하고 해당 세션을 저장한다.

---

### REQ-3: 작업 이력 조회

**REQ-3-1**
> **When** 사용자가 의뢰 상세 페이지를 열면, **the system shall** 해당 의뢰의 누적 작업 시간(`total_time_spent_ms`)을 `X시간 Y분` 형식으로 표시한다.

**REQ-3-2**
> **When** 사용자가 이력 펼침 버튼을 클릭하면, **the system shall** 해당 의뢰의 `commission_time_logs` 목록을 날짜 내림차순으로 표시한다. 각 항목에는 시작 시각, 종료 시각, 소요 시간이 포함된다.

**REQ-3-3**
> **If** 해당 의뢰에 기록된 시간 이력이 없으면, **the system shall** "아직 기록된 작업 시간이 없습니다" 안내 메시지를 표시한다.

---

### REQ-4: 상태별 타이머 연동

**REQ-4-1**
> **When** 의뢰 상태가 `대기(pending)` 또는 `진행 중(in_progress)`인 경우, **the system shall** 스톱워치 시작 버튼을 활성화한다.

**REQ-4-2**
> **When** 의뢰 상태가 `완료(done)` 또는 `취소(cancelled)`인 경우, **the system shall** 스톱워치 시작 버튼을 비활성화하고 "완료된 의뢰는 타이머를 사용할 수 없습니다" 툴팁을 표시한다.

**REQ-4-3**
> **While** 타이머가 실행 중인 동안, **the system shall** 의뢰 상태 변경 버튼을 비활성화하지 않으나, 상태를 `완료`로 변경하면 REQ-2-4 동작을 수행한다.

---

### REQ-5: 로컬 상태 지속성

**REQ-5-1**
> **When** 타이머가 시작되면, **the system shall** `localStorage`에 `{ commissionId, startedAt }` 형태의 타이머 상태를 저장한다.

**REQ-5-2**
> **When** 앱이 재시작(새로고침)되고 `localStorage`에 유효한 타이머 상태가 존재하면, **the system shall** 해당 의뢰 상세 페이지에서 타이머를 재시작 시점부터 이어서 표시한다.

**REQ-5-3**
> **When** 타이머가 정지되거나 세션이 저장되면, **the system shall** `localStorage`의 타이머 상태를 삭제한다.

**REQ-5-4**
> **If** `localStorage`에 저장된 `commissionId`가 현재 존재하지 않는 의뢰를 가리키면, **the system shall** 해당 로컬 상태를 무시하고 삭제한다.
