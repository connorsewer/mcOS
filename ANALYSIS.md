# mcOS Code Analysis

**Date:** 2026-02-06
**Analyst:** CeeBee
**Codebase:** ~8,800 lines TypeScript across 66 files

---

## Architecture Overview

```
mcOS-deploy/
├── app/                    # Next.js 16 App Router pages
│   ├── page.tsx           # SSR wrapper → page-client.tsx
│   └── [route]/           # Each route follows same pattern
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── deliverables/     # Feature-specific components
│   └── convex-provider   # Convex client setup
├── convex/               # Backend (Convex functions)
│   ├── schema.ts         # 9 tables
│   ├── agents.ts         # Agent CRUD
│   ├── tasks.ts          # Task management
│   ├── deliverables.ts   # Content versioning
│   ├── approvals.ts      # Human-in-the-loop gates
│   ├── activities.ts     # Activity feed
│   └── swarm.ts          # Real-time swarm state
├── hooks/                # Custom React hooks
├── lib/                  # Utilities (some legacy)
└── scripts/              # Migration scripts
```

**Stack:** Next.js 16.1.6 + React 19 + Convex + Tailwind + shadcn/ui

---

## ✅ What's Working Well

### 1. Schema Design
The Convex schema is well-structured with proper indexes:
- `by_squad`, `by_status`, `by_squad_status` for efficient filtering
- Vector index on documents for future semantic search
- Normalized tables with appropriate foreign keys

### 2. Version History
Deliverables have automatic versioning with `deliverableVersions` table:
- Every update creates a version record
- Tracks `editedBy`, `changeSummary`, timestamps
- Soft delete via archive status

### 3. SSR Compatibility
The ClientOnly + useConvexReady pattern is solid:
- Global singleton prevents multiple Convex clients
- Graceful fallback during SSR
- Loading skeletons for hydration

### 4. Component Structure
Clean separation of concerns:
- `page.tsx` = SSR wrapper with `force-dynamic`
- `page-client.tsx` = Client component with hooks
- Reusable UI primitives from shadcn

### 5. Activity Logging
Denormalized `agentName`/`agentRole` on write prevents N+1 queries on read:
```typescript
agentName: agent?.name,
agentRole: agent?.role,
```

---

## 🔴 Critical Issues

### 1. Dead Code - 3 Unused Files (~400 lines)

| File | Lines | Status |
|------|-------|--------|
| `lib/supabase.ts` | 194 | Legacy, not imported anywhere |
| `lib/deliverables.ts` | 209 | Legacy, self-documenting only |
| `hooks/useConvexSafe.ts` | 33 | Never imported |
| `lib/convex.ts` | 5 | Duplicate client, unused |

**Action:** Delete these files.

### 2. Approvals UI Not Wired to Backend

`app/approvals/page-client.tsx` uses **hardcoded placeholder data**:
```typescript
// Placeholder data until we wire up Convex
const placeholderApprovals: ApprovalItem[] = [...]
```

The Convex `approvals.ts` backend is complete but not connected.

**Action:** Wire up `useQuery(api.approvals.list)` and `useMutation(api.approvals.decide)`.

### 3. No Real Authentication

`convex/agents.ts` has fake auth:
```typescript
export async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  const agent = await ctx.db
    .query("agents")
    .withIndex("by_sessionKey", (q) => q.eq("sessionKey", "system"))
    .first();
  if (agent) return agent;
  const leadAgent = await ctx.db.query("agents").first();
  return leadAgent;
}
```

**Risk:** Any user can perform any mutation. Okay for internal tool, but no audit trail of who did what.

**Action:** Decide if auth is needed. If yes, add Clerk/Auth.js. If no, document this is intentional.

---

## 🟡 Performance Issues

### 1. N+1 Query in Deliverables List

`convex/deliverables.ts` line 56-70:
```typescript
const deliverablesWithAgents = await Promise.all(
  deliverables.map(async (d) => {
    const agent = d.createdByAgentId 
      ? await ctx.db.get(d.createdByAgentId)  // ← N queries!
      : null;
```

**Fix:** Batch fetch agents:
```typescript
const agentIds = [...new Set(deliverables.map(d => d.createdByAgentId).filter(Boolean))];
const agents = await Promise.all(agentIds.map(id => ctx.db.get(id)));
const agentMap = new Map(agents.filter(Boolean).map(a => [a._id, a]));
```

### 2. Naive Full-Text Search

`convex/deliverables.ts` search handler:
```typescript
deliverables = await ctx.db.query("deliverables").take(100);
const filtered = deliverables.filter(d => 
  d.title.toLowerCase().includes(lowerQuery) // ← Memory filter!
```

**Fix:** Use Convex's full-text search index when available, or at minimum use the schema's existing indexes.

### 3. No Pagination on Some Lists

`activities.list` uses simple `take()` instead of cursor pagination. Works for small datasets but won't scale.

---

## 🟡 Code Quality Issues

### 1. Type Safety Gaps

Multiple places use loose types:
```typescript
v.any()  // Used for details, payload, structuredData
as any   // Frequent in hooks
```

**Fix:** Define proper types for payloads:
```typescript
const approvalPayload = v.object({
  actionType: v.string(),
  targetId: v.optional(v.string()),
  // ...
});
```

### 2. Package.json Still "my-app"

```json
{
  "name": "my-app",  // Should be "mcos"
```

### 3. Inconsistent File Naming

Some components use PascalCase (`DeliverableCard.tsx`), others use kebab-case (`client-only.tsx`). Pick one.

### 4. Missing Error Boundaries

No React error boundaries. A crash in one component takes down the whole page.

---

## 🔵 Missing Features

### 1. Optimistic Updates
Mutations don't show pending state. User clicks, waits, then sees result.

### 2. Delete Confirmation
Archive/delete has no "Are you sure?" dialog.

### 3. Empty State Improvements
Some pages show blank instead of helpful empty states.

### 4. Mobile Responsiveness
`/live` page lacks mobile filter controls.

### 5. Dark Mode
Theme toggle exists in code but not exposed in UI.

---

## 📋 Recommended Action Plan

### Phase 1: Cleanup (30 min) ✅ COMPLETE
- [x] Delete `lib/supabase.ts`
- [x] Delete `lib/deliverables.ts`
- [x] Delete `hooks/useConvexSafe.ts`
- [x] Delete `lib/convex.ts`
- [x] Delete `scripts/migrate-deliverables.ts`
- [x] Update `package.json` name to "mcos"

### Phase 2: Wire Approvals (1 hr) ✅ COMPLETE
- [x] Import `useQuery(api.approvals.list)` in approvals page
- [x] Implement `handleApprove` / `handleReject` with `useMutation`
- [x] Add loading and error states
- [x] Add toast notifications

### Phase 3: Fix Performance (1 hr) ✅ COMPLETE
- [x] Batch agent fetching in `deliverables.list`
- [x] Batch agent fetching in `deliverables.search`
- [x] Batch agent fetching in `deliverables.byTask`
- [ ] Add cursor pagination to `activities.list` (future)

### Phase 4: Polish (2 hr) ✅ COMPLETE
- [x] Add error boundaries to all 6 page components
- [x] Add ConfirmDialog for archive action
- [x] Add toast notifications to deliverables CRUD
- [x] Fix Live page squad filter (was unused state)
- [x] Improve Live page activity feed UI
- [ ] Standardize file naming (low priority)

### Phase 5: Docs (30 min) ✅ COMPLETE
- [x] Add README with setup instructions
- [x] Document the schema
- [x] Note intentional lack of auth (internal tool)

---

## Files to Review

High-impact files for manual review:

1. `convex/deliverables.ts` - Most complex, needs perf fixes
2. `app/approvals/page-client.tsx` - Needs backend wiring
3. `convex/agents.ts` - Auth decision needed
4. `components/convex-provider.tsx` - Core of SSR fix
5. `convex/schema.ts` - Data model reference

---

*Analysis complete. Questions? Let me know which items to tackle first.*
