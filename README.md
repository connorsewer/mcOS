# mcOS — Mission Control Operating System

Command center for Ocean's 11 and Dune squads. Manage tasks, monitor agents, and track operations in real-time.

## Stack

- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS
- **Backend:** Convex (real-time database + functions)
- **UI:** shadcn/ui components
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Convex account ([convex.dev](https://convex.dev))

### Setup

1. Clone and install:
   ```bash
   git clone <repo>
   cd mcOS-deploy
   npm install
   ```

2. Set up Convex:
   ```bash
   npx convex dev
   ```
   This will create a `.env.local` file with your Convex URL.

3. Run dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── tasks/             # Task management
│   ├── agents/            # Agent roster
│   ├── deliverables/      # Content & documents
│   ├── approvals/         # Human-in-the-loop gates
│   ├── live/              # Real-time activity monitor
│   └── activity/          # Activity history
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   └── deliverables/     # Feature components
├── convex/               # Backend functions
│   ├── schema.ts         # Database schema
│   ├── agents.ts         # Agent CRUD
│   ├── tasks.ts          # Task management
│   ├── deliverables.ts   # Content versioning
│   ├── approvals.ts      # Approval workflow
│   └── activities.ts     # Activity feed
├── hooks/                # Custom React hooks
└── lib/                  # Utilities
```

## Data Model

### Core Tables

| Table | Purpose |
|-------|---------|
| `agents` | Squad members (Ocean's 11, Dune) |
| `tasks` | Work items with status workflow |
| `deliverables` | Content with version history |
| `activities` | Audit log of all actions |
| `approvals` | Human-in-the-loop action gates |
| `swarmActivity` | Real-time swarm state for Live tab |

### Status Flows

**Tasks:** inbox → assigned → in_progress → review → done (or blocked)

**Deliverables:** draft → review → approved → published (or archived)

**Approvals:** pending → approved/rejected → executed

## Authentication

⚠️ **Note:** This is an internal tool with no user authentication. The `getAuthUser()` function returns a system agent. Add Clerk/Auth.js if public access is needed.

## Deployment

### Vercel (Recommended)

1. Connect repo to Vercel
2. Add environment variable:
   - `NEXT_PUBLIC_CONVEX_URL` = your Convex deployment URL
3. Deploy

### Manual

```bash
npm run build
npm start
```

## Development

### Key Patterns

1. **SSR Safety:** All pages use `ClientOnly` wrapper to avoid Convex hydration issues
2. **Batch Queries:** Agent lookups are batched to avoid N+1 queries
3. **Optimistic UI:** Toast notifications on mutations
4. **Version History:** Deliverables auto-track edit history

### Adding a New Page

1. Create `app/[route]/page.tsx` (SSR wrapper)
2. Create `app/[route]/page-client.tsx` (client component)
3. Use `ClientOnly` wrapper with loading fallback
4. Add `export const dynamic = 'force-dynamic'`

## License

Private — Connor Laughlin

---

*Built with ☕ by CeeBee*
