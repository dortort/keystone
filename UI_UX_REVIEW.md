# Keystone UI/UX Review

Comprehensive review of all renderer components, stores, styling configuration, and shared UI primitives.

---

## 1. CRITICAL USABILITY ISSUES

### 1a. No markdown rendering for AI responses
**File:** `src/renderer/features/conversation/MessageBubble.tsx:37`

The assistant messages use `whitespace-pre-wrap` and render `message.content` as raw text. Since the AI generates markdown (headings, code blocks, lists), users see raw markdown syntax instead of formatted output. The document panel has a full `renderMarkdown` pipeline (`src/renderer/lib/markdown.ts`), but the chat does not use it.

**Impact:** The primary interaction surface (chat) looks broken for any non-trivial AI response.

### 1b. No loading state during project open
**File:** `src/renderer/App.tsx:236-281`

`handleSelectProject` makes 5+ sequential network calls (open, list threads, get each thread, list docs, get each doc). During this time there is zero visual feedback -- the user sees the previous project content or an empty state until everything resolves.

**Impact:** Users will think the app froze or the click didn't register, especially with larger projects.

### 1c. No error feedback visible to users
**Files:** `src/renderer/App.tsx:88-98, :100-111, :175-193, :195-213, :215-233`

All error handling in `handleCreateProject`, `handleNewThread`, `handleBranchThread`, `handleInquire`, and `handleRefine` silently `console.error` and swallow the failure. The user has no indication that their action failed.

**Impact:** Users will repeat actions thinking they didn't click, or abandon the app thinking it's broken.

---

## 2. SIGNIFICANT UX ISSUES

### 2a. Theme toggle exists in store but is not exposed in the UI
**File:** `src/renderer/stores/uiStore.ts:8`

The store defines `theme: 'light' | 'dark' | 'system'` and `setTheme`, but no component exposes this to the user. The Tailwind config uses `darkMode: 'class'`, and there is no code applying the `dark` class to the HTML element based on the store state. Dark mode is currently non-functional despite being wired up in the store.

### 2b. Panel ratio in uiStore is disconnected from ResizablePanel
**Files:** `src/renderer/stores/uiStore.ts:6`, `src/renderer/components/ui/ResizablePanel.tsx:18`

`uiStore` stores `panelRatio` and `setPanelRatio`, but `ResizablePanel` manages its own local `useState(defaultRatio)`. Resizing is lost on navigation or re-render. The store value is never read or written by ResizablePanel.

### 2c. Thread list shows no timestamps or context
**File:** `src/renderer/features/conversation/ThreadListItem.tsx:9`

`ThreadListItem` accepts `updatedAt` but never renders it. The `id` prop is also unused. Users with many threads have only the title to distinguish between them.

### 2d. Document tabs show only type abbreviation, not titles
**File:** `src/renderer/features/document/DocumentTabs.tsx:24`

Tabs render `doc.type.toUpperCase()` (e.g., "PRD", "TDD", "ADR") but not the document title. When a project has multiple ADRs, all tabs display "ADR" identically, making them indistinguishable.

### 2e. No confirmation before destructive actions

There is no delete/archive functionality for threads, projects, or documents exposed in the UI. If delete were added later, no confirmation pattern exists.

---

## 3. LAYOUT & VISUAL ISSUES

### 3a. Double sidebar creates a cramped workspace
**Files:** `src/renderer/components/Sidebar.tsx:12`, `src/renderer/features/conversation/ConversationPanel.tsx:27`

The project Sidebar (w-56, 224px) alongside the thread list (w-56, 224px) consumes 448px -- 35% of a 1280px display -- leaving only ~832px for the split conversation+document panels.

### 3b. Message bubble max-width is relative to wrong container
**File:** `src/renderer/features/conversation/MessageBubble.tsx:31`

`max-w-[80%]` is relative to the parent flex row with padding. On narrow panes, bubbles become uncomfortably narrow. A fixed `max-w-prose` or `max-w-2xl` would be more predictable.

### 3c. Document outline has no fixed width
**File:** `src/renderer/features/document/DocumentOutline.tsx:13`

The outline has no width constraint, causing layout shifts when switching between documents with different heading lengths.

### 3d. Selection toolbar positioning can overflow viewport
**File:** `src/renderer/features/document/MarkdownPreview.tsx:32`

Toolbar position is computed without clamping. Selections near container edges cause the toolbar to render partially off-screen.

### 3e. Resizable panel divider is too thin
**File:** `src/renderer/components/ui/ResizablePanel.tsx:58`

The `w-1` (4px) drag handle is at the lower end of comfortable click targets. Most applications use 6-8px with a wider hover zone.

---

## 4. ACCESSIBILITY ISSUES

### 4a. Dialog lacks focus trap
**File:** `src/renderer/components/ui/Dialog.tsx`

The Dialog handles Escape to close but does not trap focus within the dialog or return focus to the trigger on close. Keyboard users can tab behind the modal.

### 4b. No ARIA attributes on interactive elements
- Sidebar toggle in `TitleBar.tsx:19-28` -- no `aria-label` or `aria-expanded`
- Radio buttons in `ProviderCard.tsx:41-46` -- no proper label association
- `ThreadListItem` buttons -- no `aria-current` for active state
- `Dialog` component -- uses plain `<div>` instead of `role="dialog"` with `aria-modal`

### 4c. SVG icons have no accessible text

All inline SVGs (send button, settings gear, sidebar toggle, branch, inquire, refine) have no `aria-label` or `<title>` element.

### 4d. Insufficient color contrast in subtle text

`text-gray-400` and `text-gray-500` used for secondary text may not meet WCAG AA contrast requirements against white or dark backgrounds.

---

## 5. INTERACTION DESIGN GAPS

### 5a. No keyboard shortcuts

No keyboard shortcuts for common actions: new thread (Cmd+N), toggle sidebar (Cmd+B), send message (Cmd+Enter), switch document tabs, etc.

### 5b. Message input doesn't indicate Shift+Enter for newlines
**File:** `src/renderer/features/conversation/MessageInput.tsx:21-26`

Enter to send and Shift+Enter for newlines is supported but not visually indicated.

### 5c. No drag-and-drop or file attachment

Users cannot drag in existing documents, images, or reference files into conversations.

### 5d. Streaming indicator logic has a brief gap
**File:** `src/renderer/features/conversation/ChatView.tsx:18`

The bouncing-dots indicator appears only when `isStreaming && !streamingMessageId` -- the brief window before the first chunk. The transition from dots to cursor-in-bubble can feel jarring.

### 5e. No search or filter in thread list

Users with many conversation threads have no way to search or filter. Only "active" threads are shown with no way to view archived ones.

---

## 6. DESIGN SYSTEM OBSERVATIONS

### 6a. Custom semantic colors defined but not used
**File:** `tailwind.config.ts`

Custom tokens `surface`, `panel`, and `accent` are defined but components use raw Tailwind colors directly (`bg-gray-100`, `bg-indigo-600`, etc.), making global theme changes require touching every file.

### 6b. Inconsistent button patterns

`ADRPromptDialog.tsx:33-45` uses raw `<button>` elements with inline classes, while other dialogs use the `<Button>` component. This creates visual inconsistency.

### 6c. No transition animations between states

State changes (project switching, thread selection, sidebar toggle) happen instantly with no transitions. Even subtle 150ms fade-ins would improve perceived polish.

---

## 7. RECOMMENDED PRIORITY FIXES

| Priority | Issue | Effort |
|----------|-------|--------|
| P0 | Render markdown in chat messages | Low |
| P0 | Add loading state for project open | Low |
| P0 | Surface errors as toast notifications | Medium |
| P1 | Wire up dark mode toggle in Settings | Low |
| P1 | Show document title in tabs, not just type | Low |
| P1 | Add timestamps to ThreadListItem | Low |
| P1 | Add `role="dialog"` and focus trap to Dialog | Medium |
| P2 | Use custom design tokens instead of raw colors | Medium-High |
| P2 | Add keyboard shortcuts for common actions | Medium |
| P2 | Persist panel ratio in uiStore/ResizablePanel | Low |
| P2 | Widen resizable panel drag handle | Low |
| P2 | Add Shift+Enter hint to message input | Low |
| P3 | Add thread search/filter | Medium |
| P3 | Clamp SelectionToolbar position to viewport | Low |
| P3 | Standardize Button usage across all dialogs | Low |
