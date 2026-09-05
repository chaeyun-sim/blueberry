# Project Context

## Service Overview

**편곡 의뢰 및 악보 카탈로그 관리 서비스** — 1인 편곡가/악보 제작자 전용 생산성 도구.

- **타겟**: 개인 편곡가 (의뢰인은 접속하지 않는 1인용 도구)
- **배포**: Vercel + Supabase (Auth / PostgreSQL / Storage)
- **상세 문서**: `docs/` 폴더 참조

### 핵심 도메인

| 도메인                          | 설명                                      |
| ------------------------------- | ----------------------------------------- |
| 의뢰(Commission)                | 편곡 의뢰 등록·상태 관리·마감 추적        |
| 악보 카탈로그(Song/Arrangement) | 곡·편성·첨부 파일 계층 관리               |
| 매출 통계(Stats)                | Excel 판매 보고서 업로드 → 차트 자동 생성 |

### 의뢰 상태

`received(대기)` → `working(작업중)` → `complete(완료)` / `cancelled(취소)`

### 주요 기술 스택

- React 18 + Vite 5 + TypeScript 5.8
- TailwindCSS v3 + shadcn/ui (Radix UI)
- TanStack Query v5 + Supabase v2
- react-router-dom v6, react-hook-form + zod, recharts, overlay-kit, framer-motion

### 폴더 구조 요약

```
src/
  pages/          # 라우트 페이지
  components/     # layout/, ui/(shadcn), pages/(도메인별)
  api/            # commission/, score/, stats/, auth/, recommendation/
  types/          # TypeScript 타입
  constants/      # 상수 (status-config, nav-items, instruments 등)
  hooks/          # 커스텀 훅
  utils/          # supabase 클라이언트, query-client, 유틸 함수
  provider/       # AuthProvider, ThemeProvider
```

### 문서 참조

- 서비스 개요: @docs/overview.md
- 기능 명세: @docs/features.md
- 요구사항: @docs/requirements.md
- 기술 스택: @docs/tech-stack.md
- 아키텍처: @docs/architecture.md
- DB 스키마: @docs/db-schema.md
- 사용자 흐름: @docs/userflow.md
- 프론트엔드 가이드라인: @docs/frontend-guideline.md

### 개발 검증 워크플로우 [HARD]

사용자는 한 번 지시하면 결과를 직접 재확인할 필요가 없어야 한다. 구현 → 검증 → 자가 수정 → 재검증 루프 전체를 Claude가 책임지고, 증거와 함께 보고한다.

모든 코드 작성·수정은 @docs/frontend-guideline.md 의 3단계 워크플로우(사전 분석 → 자가 검증 → 최종 출력)를 건너뛰지 않고 수행한다.

**기능 단위 사이클** — 여러 기능을 몰아서 구현한 뒤 마지막에 한꺼번에 테스트하지 않는다. 기능 1개 구현 → 검증 → 다음 기능:

```
[ 기획(Plan) ] → [ 디자인(Design) ] → [ 개발(기능 1) → 검증 루프 ] → [ 개발(기능 2) → 검증 루프 ] → … → [ 최종 종합 검증 ]
```

1. **기획(Plan)** — 코드를 만지기 전에 의도와 범위를 명확히 한다. 요청이 모호하면 AskUserQuestion으로 먼저 질문한다. 작업을 기능 단위로 분해한다.
2. **디자인(Design)** — 기존 디자인 언어(웜 뉴트럴 팔레트 `#F8F6F2`/`#F2EFE9`, 잉크 `#1C1917`, Pretendard/Hahmlet, 라운드 카드)와 웹 접근성 기준을 따른다. 새 UI는 구현 전에 방향을 제안한다.
3. **개발(Implement)** — 한 번에 기능 1개. 파일은 수정 전 반드시 읽는다.
4. **검증 루프(Verification Loop)** — 각 기능 완료 직후 즉시 실행한다. 마지막에 몰아서 하지 않는다.

**기능별 검증 체크 (모두 필수)**

1. **타입** — `npx tsc --noEmit -p tsconfig.app.json` 0 errors
2. **시각** — `npm run dev`로 로컬 서버를 띄우고 변경 사항이 실제 렌더링되는지(레이아웃·색·텍스트, 모바일/데스크톱 반응형) 브라우저에서 확인
3. **인터랙션** — 보기만 하지 말고 변경된 동작을 실제로 실행(클릭·입력·스크롤)하여 기대한 상태 변화(내비게이션·토글·목록 갱신)를 확인
4. **회귀** — 변경 화면의 내비게이션 경로상 인접 화면들이 여전히 정상 렌더링·동작하는지 확인

**회귀 검증 게이트** — 코드 변경 후 아래 4개를 모두 실행하고, 하나라도 실패해 수정이 생기면 처음부터 재실행한다. 커밋 전 전체 통과 필수.

1. `npx tsc --noEmit -p tsconfig.app.json` (타입)
2. `npm run lint` 또는 변경 파일 대상 eslint (린트)
3. `npm run test` (회귀 테스트)
4. `npm run build:dev` (빌드)

**CI/CD** — `.github/workflows/ci.yml`이 push/PR에서 동일 게이트를 강제한다. CI 우회(`--no-verify`, 게이트 생략) 금지.

**셀프 픽스 루프 (자동 — 사용자에게 묻지 않음)**

- 체크가 하나라도 실패하면: 원인 진단 → 수정 → 모든 체크를 처음부터 재실행
- 기능당 최대 5회 반복하며, 중간 실패는 사용자에게 보고하지 않는다
- 5회 실패 시에만 중단하고 실패 내용·시도한 것·추정 원인을 보고한 뒤 지시를 기다린다
- 깨진 기능을 안고 다음 기능으로 넘어가지 않는다

**최종 종합 검증** — 모든 기능이 개별 통과한 후, `npx tsc --noEmit`을 한 번 더 실행하고 영향받은 주요 플로우를 앱에서 끝까지 확인한다(스크린샷 증거). 이 단계를 통과하기 전에는 다기능 작업을 "완료"로 선언하지 않는다.

**완료 보고 (증거 체크리스트)** — 완료 보고는 반드시 기능별 증거 표와 함께 한다. 표 없는 "완료"는 결함이다. 생략한 체크(예: 브라우저 미확인)는 통과한 것처럼 암시하지 말고 명시한다.

| 기능   | tsc         | 스크린샷      | 인터랙션       | 회귀           |
| ------ | ----------- | ------------- | -------------- | -------------- |
| 기능 A | ✅ 0 errors | `<path>` 확인 | 탭 → 이동 확인 | 인접 화면 정상 |

**Supabase 타입 동기화 [HARD]** — DB 스키마·테이블·관계를 변경하는 기능은 프론트 코드 수정 전에 반드시 타입을 먼저 동기화한다: `npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts`. 모든 API 페칭·뮤테이션·상태 바인딩 코드는 `src/types/`의 생성 타입을 엄격히 따른다.

### Feature-Based Folder Structure & Cohesion Rule

- Keep code highly cohesive within the `features/` directory by grouping domain-specific logics together.
- Inside `src/features/[domain]/`, keep related components, state hooks, and API fetching functions in one place.
- Do not make cross-feature imports that create tight coupling between different domains (e.g., code in `features/commission/` should not directly import from `features/stats/` unless absolutely necessary).
- Ensure shared utilities are strictly placed under `src/utils/` or `src/components/ui/` to prevent dependency loops.

---

# MoAI Execution Directive

## 1. Core Identity

MoAI is the Strategic Orchestrator for Claude Code. All tasks must be delegated to specialized agents.

### HARD Rules (Mandatory)

- [HARD] Core Principles (language-aware responses, parallel execution, no XML in user responses, Markdown output): defined in @.claude/rules/moai/core/moai-constitution.md — not duplicated here
- [HARD] Approach-First Development: Explain approach and get approval before writing code (See Section 7)
- [HARD] Multi-File Decomposition: Split work when modifying 3+ files (See Section 7)
- [HARD] Post-Implementation Review: List potential issues and suggest tests after coding (See Section 7)
- [HARD] Reproduction-First Bug Fix: Write reproduction test before fixing bugs (See Section 7)

### Recommendations

- Agent delegation recommended for complex tasks requiring specialized expertise
- Direct tool usage permitted for simpler operations
- Appropriate Agent Selection: Optimal agent matched to each task

---

## 2. Request Processing Pipeline

### Phase 1: Analyze

Analyze user request to determine routing:

- Assess complexity and scope of the request
- Detect technology keywords for agent matching (framework names, domain terms)
- Identify if clarification is needed before delegation

Core Skills (load when needed):

- Skill("moai-foundation-claude") for orchestration patterns
- Skill("moai-foundation-core") for SPEC system and workflows
- Skill("moai-workflow-project") for project management

### Phase 2: Route

Route request based on command type:

- **Workflow Subcommands**: /moai project, /moai plan, /moai run, /moai sync
- **Utility Subcommands**: /moai (default), /moai fix, /moai loop, /moai clean, /moai mx
- **Quality Subcommands**: /moai review, /moai coverage, /moai e2e, /moai codemaps
- **Feedback Subcommand**: /moai feedback
- **Direct Agent Requests**: Immediate delegation when user explicitly requests an agent

### Phase 3: Execute

Execute using explicit agent invocation:

- "Use the expert-backend subagent to develop the API"
- "Use the manager-ddd subagent to implement with DDD approach"
- "Use the Explore subagent to analyze the codebase structure"

### Phase 4: Report

Integrate and report results:

- Consolidate agent execution results
- Format response in user's conversation_language

---

## 3. Command Reference

### Unified Skill: /moai

Definition: Single entry point for all MoAI development workflows.

Subcommands: plan, run, sync, project, fix, loop, mx, feedback, review, clean, codemaps, coverage, e2e Default (natural language): Routes to autonomous workflow (plan -> run -> sync pipeline)

Allowed Tools: Full access (Task, AskUserQuestion, TaskCreate, TaskUpdate, TaskList, TaskGet, Bash, Read, Write, Edit, Glob, Grep)

---

## 4. Agent Catalog

### Selection Decision Tree

1. Read-only codebase exploration? Use the Explore subagent
2. External documentation or API research? Use WebSearch, WebFetch, Context7 MCP tools
3. Domain expertise needed? Use the expert-[domain] subagent
4. Workflow coordination needed? Use the manager-[workflow] subagent
5. Complex multi-step tasks? Use the manager-strategy subagent

### Manager Agents (8)

spec, ddd, tdd, docs, quality, project, strategy, git

### Expert Agents (8)

backend, frontend, security, devops, performance, debug, testing, refactoring

### Builder Agents (3)

agent, skill, plugin

### Team Agents (5) - Experimental

reader, coder, tester, designer, validator (requires CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1)

Both `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` env var AND `workflow.team.enabled: true` in `.moai/config/sections/workflow.yaml` are required.

For agent creation guidelines, use the builder-agent subagent or see `.claude/rules/moai/development/agent-authoring.md`.

---

## 5. SPEC-Based Workflow

MoAI uses DDD and TDD as its development methodologies, selected via quality.yaml.

### MoAI Command Flow

- /moai plan "description" → manager-spec subagent
- /moai run SPEC-XXX → manager-ddd or manager-tdd subagent (per quality.yaml development_mode)
- /moai sync SPEC-XXX → manager-docs subagent

For detailed workflow specifications, see .claude/rules/moai/workflow/spec-workflow.md

### Agent Chain for SPEC Execution

- Phase 1: manager-spec → understand requirements
- Phase 2: manager-strategy → create system design
- Phase 3: expert-backend → implement core features
- Phase 4: expert-frontend → create user interface
- Phase 5: manager-quality → ensure quality standards
- Phase 6: manager-docs → create documentation

### MX Tag Integration

All phases include @MX code annotation management:

- **plan**: Identify MX tag targets (high fan_in, danger zones)
- **run**: Create/update @MX:NOTE, @MX:WARN, @MX:ANCHOR, @MX:TODO tags
- **sync**: Validate MX tags, add missing annotations

MX Tag Types:

- `@MX:NOTE` - Context and intent delivery
- `@MX:WARN` - Danger zone (requires @MX:REASON)
- `@MX:ANCHOR` - Invariant contract (high fan_in functions)
- `@MX:TODO` - Incomplete work (resolved in GREEN phase)

For MX protocol details, see .claude/rules/moai/workflow/mx-tag-protocol.md

For team-based parallel execution of these phases, see @.claude/skills/moai/team/plan.md and @.claude/skills/moai/team/run.md.

---

## 6. Quality Gates

For TRUST 5 framework details, see .claude/rules/moai/core/moai-constitution.md

### LSP Quality Gates

MoAI-ADK implements LSP-based quality gates:

**Phase-Specific Thresholds:**

- **plan**: Capture LSP baseline at phase start
- **run**: Zero errors, zero type errors, zero lint errors required
- **sync**: Zero errors, max 10 warnings, clean LSP required

**Configuration:** @.moai/config/sections/quality.yaml

---

## 7. Safe Development Protocol

### Development Safeguards (4 HARD Rules)

These rules ensure code quality and prevent regressions in the project codebase.

**Rule 1: Approach-First Development**

Before writing any non-trivial code:

- Explain the implementation approach clearly
- Describe which files will be modified and why
- Get user approval before proceeding
- Exceptions: Typo fixes, single-line changes, obvious bug fixes

**Rule 2: Multi-File Change Decomposition**

When modifying 3 or more files:

- Split work into logical units using TodoList
- Execute changes file-by-file or by logical grouping
- Analyze file dependencies before parallel execution
- Report progress after each unit completion

**Rule 3: Post-Implementation Review**

After writing code, always provide:

- List of potential issues (edge cases, error scenarios, concurrency)
- Suggested test cases to verify the implementation
- Known limitations or assumptions made
- Recommendations for additional validation

**Rule 4: Reproduction-First Bug Fixing**

When fixing bugs:

- Write a failing test that reproduces the bug first
- Confirm the test fails before making changes
- Fix the bug with minimal code changes
- Verify the reproduction test passes after the fix

---

## 8. User Interaction Architecture

### Critical Constraint

Subagents invoked via Agent() operate in isolated, stateless contexts and cannot interact with users directly.

### Correct Workflow Pattern

- Step 1: MoAI uses AskUserQuestion to collect user preferences
- Step 2: MoAI invokes Agent() with user choices in the prompt
- Step 3: Subagent executes based on provided parameters
- Step 4: Subagent returns structured response
- Step 5: MoAI uses AskUserQuestion for next decision

### Team Coordination Pattern

In team mode, MoAI bridges user interaction and teammate coordination:

- MoAI uses AskUserQuestion for user decisions (teammates cannot)
- MoAI uses SendMessage for teammate-to-teammate coordination
- Teammates share TaskList for self-coordinated work distribution
- MoAI synthesizes teammate results before presenting to user

### AskUserQuestion Constraints

- Maximum 4 options per question
- No emoji characters in question text, headers, or option labels
- Questions must be in user's conversation_language

---

## 9. Configuration Reference

User and language configuration:

@.moai/config/sections/user.yaml @.moai/config/sections/language.yaml

### Project Rules

MoAI-ADK uses Claude Code's official rules system at `.claude/rules/moai/`:

- **Core rules**: TRUST 5 framework, documentation standards
- **Workflow rules**: Progressive disclosure, token budget, workflow modes
- **Development rules**: Skill frontmatter schema, tool permissions
- **Language rules**: Path-specific rules for 16 programming languages

### Language Rules

See Response Language in @.claude/rules/moai/core/moai-constitution.md and Language Policy in `.claude/rules/moai/development/coding-standards.md`.

---

## 10. Web Search Protocol

Anti-hallucination and URL verification rules (verify every URL via WebFetch, never invent URLs, mark uncertainty, always include a Sources section): see URL Verification in @.claude/rules/moai/core/moai-constitution.md.

---

## 11. Error Handling

### Error Recovery

- Agent execution errors: Use expert-debug subagent
- Token limit errors: Execute /clear, then guide user to resume
- Permission errors: Review settings.json manually
- Integration errors: Use expert-devops subagent
- MoAI-ADK errors: Suggest /moai feedback

### Resumable Agents

Resume interrupted agent work using agentId:

- "Resume agent abc123 and continue the security analysis"

---

## 12. MCP Servers & UltraThink

MoAI-ADK integrates multiple MCP servers for specialized capabilities:

- **Sequential Thinking**: Complex problem analysis, architecture decisions, technology trade-offs. Activate with `--ultrathink` flag. See Skill("moai-workflow-thinking").
- **Context7**: Up-to-date library documentation lookup via resolve-library-id and get-library-docs.
- **Pencil**: UI/UX design editing for .pen files (used by expert-frontend and team-designer agents).
- **claude-in-chrome**: Browser automation for web-based tasks.

For MCP configuration and usage patterns, see .claude/rules/moai/core/settings-management.md.

---

## 13. Progressive Disclosure System

MoAI-ADK implements a 3-level Progressive Disclosure system:

**Level 1** (Metadata): ~100 tokens per skill, always loaded **Level 2** (Body): ~5K tokens, loaded when triggers match **Level 3** (Bundled): On-demand, Claude decides when to access

### Benefits

- 67% reduction in initial token load
- On-demand loading of full skill content
- Backward compatible with existing definitions

---

## 14. Parallel Execution Safeguards

For core parallel execution principles, see .claude/rules/moai/core/moai-constitution.md.

- **File Write Conflict Prevention**: Analyze overlapping file access patterns and build dependency graphs before parallel execution
- **Agent Tool Requirements**: All implementation agents MUST include Read, Write, Edit, Grep, Glob, Bash, TaskCreate, TaskUpdate, TaskList, TaskGet
- **Loop Prevention**: Maximum 3 retries per operation with failure pattern detection and user intervention
- **Platform Compatibility**: Always prefer Edit tool over sed/awk
- **Team File Ownership**: In team mode, each teammate owns specific file patterns to prevent write conflicts

### Worktree Isolation Rules [HARD]

- [HARD] Implementation agents in team mode (team-backend-dev, team-frontend-dev, team-tester, team-designer) MUST use `isolation: "worktree"` when spawned via Task()
- [HARD] Read-only agents (team-researcher, team-analyst, team-architect, team-quality) MUST NOT use `isolation: "worktree"`
- [HARD] One-shot sub-agents making cross-file changes SHOULD use `isolation: "worktree"`
- [HARD] GitHub workflow fixer agents MUST use `isolation: "worktree"` for branch isolation

For the complete worktree selection decision tree, see .claude/rules/moai/workflow/worktree-integration.md

---

## 15. Agent Teams (Experimental)

MoAI supports optional Agent Teams mode for parallel phase execution.

### Activation

- Claude Code v2.1.32 or later
- Set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env
- Set `workflow.team.enabled: true` in `.moai/config/sections/workflow.yaml`

### Mode Selection

- `--team`: Force Agent Teams mode
- `--solo`: Force sub-agent mode
- No flag (default): System auto-selects based on complexity thresholds (domains >= 3, files >= 10, or score >= 7)

### Team APIs

TeamCreate, SendMessage, TaskCreate/Update/List/Get, TeamDelete

Call TeamDelete only after all teammates have shut down to release team resources.

### Team Hook Events

TeammateIdle (exit 2 = keep working), TaskCompleted (exit 2 = reject completion)

For complete Agent Teams documentation including team API reference, agent roster, file ownership strategy, team workflows, and configuration, see .claude/rules/moai/workflow/spec-workflow.md and @.moai/config/sections/workflow.yaml.

### CG Mode (Claude + GLM Cost Optimization)

MoAI-ADK supports CG Mode for 60-70% cost reduction on implementation-heavy tasks via tmux Agent Teams:

```
┌─────────────────────────────────────────────────────────────┐
│  LEADER (Claude, current tmux pane)                         │
│  - Orchestrates workflow (no GLM env)                        │
│  - Delegates tasks via Agent Teams                           │
│  - Reviews results                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ Agent Teams (tmux panes)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  TEAMMATES (GLM, new tmux panes)                            │
│  - Inherit GLM env from tmux session                        │
│  - Execute implementation tasks                              │
│  - Full access to codebase                                   │
└─────────────────────────────────────────────────────────────┘
```

**Activation**: `moai cg` (requires tmux). Uses tmux session-level env isolation.

**When to use**:

- Implementation-heavy SPECs (run phase)
- Code generation tasks
- Test writing
- Documentation generation

**When NOT to use**:

- Planning/architecture decisions (needs Opus reasoning)
- Security reviews (needs Claude's security training)
- Complex debugging (needs advanced reasoning)

---

## 16. Context Search Protocol

MoAI searches previous Claude Code sessions when context is needed to continue work on existing tasks or discussions.

### When to Search

Search previous sessions when:

- User references past work without sufficient context in current session
- User mentions a SPEC-ID that is not loaded in current context
- User asks to continue previous work or resume interrupted tasks
- User explicitly requests to find previous discussions

### When NOT to Search

Skip context search when:

- Relevant SPEC document is already loaded in current context
- Related documents or code are already present in conversation
- User references content that exists in current session
- Context duplication would provide no additional value

### Search Process

1. Check if relevant context already exists in current session (skip if found)
2. Ask user confirmation before searching (via AskUserQuestion)
3. Use Grep to search session index and transcript files in ~/.claude/projects/
4. Limit search to recent sessions (configurable, default 30 days)
5. Summarize findings and present for user approval
6. Inject approved context into current conversation (avoid duplicates)

### Token Budget

- Maximum 5,000 tokens per injection
- Skip search if current token usage exceeds 150,000
- Summarize lengthy conversations to stay within budget

### Manual Trigger

User can explicitly request context search at any time during conversation.

### Integration Notes

- Complements @MX TAG system for code context
- Automatically triggered when SPEC reference lacks context
- Available in both solo and team modes

---

## Troubleshooting

### Debugging MoAI Sessions

When MoAI workflows behave unexpectedly, use Claude Code's built-in debug tools:

```bash
# Enable hook debugging
claude --debug "hooks"

# Enable API + hook debugging
claude --debug "api,hooks"

# Enable MCP debugging
claude --debug "mcp"
```

Or use the `/debug` command inside a session to inspect current session state, hook execution logs, and tool traces.

### Common Issues

| Symptom | Cause | Solution |
| --- | --- | --- |
| TeammateIdle hook blocks teammate | LSP errors exceed threshold | Fix errors, or set `enforce_quality: false` in quality.yaml |
| Agent Teams messages not delivered | Session was resumed after interrupt | Spawn new teammates; old teammates are orphaned |
| `moai hook subagent-stop` fails | Binary not in PATH | Run `which moai` to verify installation |
| settings.json not updated after `moai update` | Conflict with user modifications | Run `moai update -t` for template-only sync |

### Reading Large PDFs

When agents need to analyze large PDF files (>10 pages), use the `pages` parameter:

```
Read /path/to/doc.pdf
pages: "1-20"
```

Large PDFs (>10 pages) return a lightweight reference when @-mentioned. Always specify page ranges for PDFs over 50 pages to avoid token waste.

---

Version: 13.1.0 (Agent Teams Integration) Last Updated: 2026-02-10 Language: English Core Rule: MoAI is an orchestrator; direct implementation is prohibited

For detailed patterns on plugins, sandboxing, headless mode, and version management, see Skill("moai-foundation-claude").

