# Keystone - Product Requirements Document

> **Version**: 0.1.0 (Draft)  
> **Last Updated**: 2026-02-05

## 1. Overview

**Keystone** is an open-source Electron desktop application designed to streamline AI-assisted software architecture. It enables teams to collaboratively generate, refine, and maintain critical project documentation—**PRDs** (Product Requirements Documents), **TDDs** (Technical Design Documents), and **ADRs** (Architecture Decision Records)—through conversational AI interactions.

### 1.1 Problem Statement

Software teams often struggle with:
- **Documentation debt**: Architecture decisions go undocumented or become stale
- **Context loss**: Rationale behind decisions is forgotten over time
- **Fragmented tooling**: Conversations happen in chat, documents live elsewhere
- **Iteration friction**: Refining documentation requires manual back-and-forth

### 1.2 Solution

Keystone provides a unified workspace where:
- AI conversations and document artifacts live side-by-side
- Users can highlight document sections to inquire or refine content
- Decision pivots automatically generate ADRs capturing the reasoning
- AI proactively suggests improvements via inline comments

---

## 2. Target Users

| Persona | Description |
|---------|-------------|
| **Technical Lead** | Owns architecture decisions, needs to document and communicate rationale |
| **Product Manager** | Drafts and iterates on PRDs, collaborates with engineering |
| **Senior Engineer** | Contributes to TDDs, reviews architectural choices |
| **Startup Founder** | Wears multiple hats, needs efficient documentation workflow |

---

## 3. Core Features

### 3.1 Conversation Threads

- **Multi-threaded conversations**: Users can maintain multiple parallel conversation threads with the AI
- **Context persistence**: Each thread maintains full conversation history and document context
- **Thread branching**: Start new threads from specific points to explore alternatives

### 3.2 Document Workspace

The UI is split into two primary panels:

| Panel | Purpose |
|-------|---------|
| **Conversation Panel** | Active AI chat threads, thread list, input area |
| **Document Panel** | Live preview of PRD/TDD/ADR being edited, with inline comments |

### 3.3 Highlight-to-Interact

Users can select/highlight any section of a document to:

| Action | Behavior |
|--------|----------|
| **Inquire** | Ask questions about the selection without modifying the document |
| **Refine** | Request changes, improvements, or expansions to the selection |

Both actions open a contextual conversation scoped to the selection.

### 3.4 Decision Tracking & ADR Generation

When a conversation leads to changing a previous decision:
- Keystone prompts the user to generate an **ADR**
- The ADR captures: context, options considered, decision, consequences
- ADRs link back to the originating conversation thread

### 3.5 Proactive AI Recommendations

The AI can surface suggestions through two mechanisms:

| Mechanism | Description |
|-----------|-------------|
| **Conversation Questions** | AI asks clarifying or improvement questions in the active thread |
| **Document Comments** | Inline annotations appear in the document preview; clicking opens a new conversation |

---

## 4. Document Types

### 4.1 PRD (Product Requirements Document)
- Problem statement, goals, user personas
- Feature specifications, acceptance criteria
- Success metrics

### 4.2 TDD (Technical Design Document)
- System architecture, component breakdown
- Data models, API contracts
- Technical constraints and trade-offs

### 4.3 ADR (Architecture Decision Record)
- Context and problem statement
- Decision drivers
- Considered options with pros/cons
- Decision outcome and consequences

---

## 5. User Flows

### 5.1 Starting a New Project

```
1. User creates new project workspace
2. User starts conversation: "I want to build a task management app"
3. AI asks clarifying questions, drafts initial PRD sections
4. PRD appears in Document Panel as sections are generated
5. User highlights unclear section → selects "Inquire"
6. AI explains rationale in a scoped thread
```

### 5.2 Refining a Document

```
1. User highlights feature description in PRD
2. Selects "Refine" → "Add more detail about edge cases"
3. AI proposes expanded text
4. User accepts/modifies → document updates in-place
```

### 5.3 Changing a Decision

```
1. User was going to use REST API (documented in TDD)
2. After discussion, decides GraphQL is better fit
3. Keystone detects decision change → prompts ADR creation
4. ADR-001 generated documenting the REST → GraphQL pivot
5. TDD updates to reflect new decision, links to ADR-001
```

### 5.4 AI-Initiated Improvement

```
1. AI analyzes PRD, notices missing success metrics
2. Adds inline comment: "Consider defining measurable success criteria"
3. User clicks comment → opens conversation thread
4. AI helps draft metrics section
```

---

## 6. UI/UX Requirements

### 6.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Keystone                                    [Project ▾] ⚙️  │
├─────────────────────┬───────────────────────────────────────┤
│                     │                                       │
│  THREADS            │  DOCUMENT PREVIEW                     │
│  ─────────────      │  ─────────────────                    │
│  ▸ Initial PRD      │  # Product Requirements               │
│  ▸ API Discussion   │                                       │
│    ▸ REST vs GQL    │  ## 1. Overview                       │
│  ▸ Auth approach    │  [AI Comment 💬]                      │
│                     │  This application will...             │
│  ───────────────    │                                       │
│  ACTIVE THREAD      │  ## 2. Features         [highlight]   │
│  ───────────────    │  ████████████████████                 │
│                     │         ┌──────────────┐              │
│  User: Can we add   │         │ 🔍 Inquire   │              │
│  offline support?   │         │ ✏️ Refine    │              │
│                     │         └──────────────┘              │
│  AI: Yes, I'd       │                                       │
│  recommend using... │  ## 3. Technical...                   │
│                     │                                       │
│  [Type message...] ▶│                                       │
└─────────────────────┴───────────────────────────────────────┘
```

### 6.2 Key Interactions

- **Text selection**: Highlights text, shows floating action menu
- **Comment badges**: Clickable inline indicators for AI suggestions
- **Thread switching**: Seamless navigation between conversation threads
- **Live sync**: Document updates reflect immediately in preview

### 6.3 Design Principles

1. **Conversations and documents are peers** — Equal visual weight, always visible
2. **Context is king** — Every interaction preserves and leverages prior context
3. **Decisions are first-class** — ADRs are integral, not afterthoughts
4. **AI assists, user decides** — Suggestions are non-intrusive, user always in control

---

## 7. Technical Considerations

> *Detailed in TDD. High-level notes here.*

- **Platform**: Electron (cross-platform desktop)
- **Storage**: Local-first with optional cloud sync
- **Export**: Markdown, PDF, HTML formats

### 7.1 AI Provider Integration

Keystone supports multiple AI providers, prioritizing **subscription-based access** over per-token pricing:

| Provider | Subscription Tier | Notes |
|----------|------------------|-------|
| **OpenAI** | ChatGPT Plus/Team/Enterprise | Leverages subscription allowances |
| **Google** | Gemini Advanced (Google One AI Premium) | Uses Gemini 1.5/2.0 via subscription |
| **Anthropic** | Claude Pro/Team | Access to Claude 3.5/4 Sonnet/Opus |

**Design principles for AI integration**:

1. **Subscription-first**: Users authenticate with their existing subscriptions rather than providing API keys with token billing
2. **Provider agnostic**: Core functionality works identically across providers
3. **Graceful degradation**: If subscription limits are reached, user is notified with options (wait, switch provider, or use API key fallback)
4. **Local model support** *(future)*: Option for local LLMs (Ollama, LM Studio) for offline/private use

### 7.2 AI Agent Architecture

Keystone uses **specialized sub-agents** orchestrated by a central coordinator to improve output quality:

```
User Input
    │
    ▼
┌─────────────────────┐
│  Orchestrator Agent │  ← Routes to specialists, synthesizes outputs
└─────────┬───────────┘
          │
    ┌─────┴─────┬─────────────┬──────────────┐
    ▼           ▼             ▼              ▼
┌────────┐ ┌─────────┐ ┌───────────┐ ┌──────────┐
│Require-│ │Technical│ │ Decision  │ │ Critic/  │
│ments   │ │Architect│ │ Analyst   │ │ Reviewer │
└────────┘ └─────────┘ └───────────┘ └──────────┘
```

#### Specialist Agents

| Agent | Specialty | Role |
|-------|-----------|------|
| **Requirements Analyst** | Eliciting needs, gap detection | Drives PRD drafting, asks clarifying questions |
| **Technical Architect** | System design, trade-offs | Leads TDD creation, evaluates technical options |
| **Decision Analyst** | Structured reasoning, pros/cons | Generates ADRs, surfaces decision points |
| **Critic / Reviewer** | Inconsistency detection, edge cases | Reviews docs, spots contradictions |
| **UX Advisor** | User flows, usability | Ensures features are user-centric |
| **Security Analyst** | Threat modeling, compliance | Flags security considerations |
| **Coherence Checker** | Cross-document alignment | Ensures PRD ↔ TDD ↔ ADRs stay in sync |

#### Orchestration Logic

The **Orchestrator** routes to specialists based on:
- **Document type**: PRD → Requirements Analyst; TDD → Technical Architect
- **User action**: Refinement → relevant specialist; Inquiry → Critic or domain expert
- **Proactive triggers**: Coherence Checker runs after significant edits; Security Analyst flags sensitive patterns

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Time to first PRD draft | < 30 minutes |
| ADR generation rate | 80%+ of significant decisions documented |
| User satisfaction (NPS) | > 50 |
| Weekly active usage | 3+ sessions/week for active projects |

---

## 9. Open Questions

- [ ] Should conversations be shareable/collaborative in v1?
- [ ] How to handle conflicting AI suggestions across threads?
- [ ] What's the right granularity for ADR generation triggers?
- [ ] Integration with version control (git) for documents?

---

## 10. Appendix

### 10.1 Glossary

| Term | Definition |
|------|------------|
| **PRD** | Product Requirements Document — defines what to build and why |
| **TDD** | Technical Design Document — defines how to build it |
| **ADR** | Architecture Decision Record — documents a significant decision |
| **Thread** | A conversation context with the AI |

