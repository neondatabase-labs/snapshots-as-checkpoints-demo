![Snapshots as Checkpoints](./assets/home.png)

### Live demo

- https://snapshots-as-checkpoints-demo.vercel.app/

### What is this?

Snapshots as Checkpoints is a demo that showcases how to build a “checkpoint” abstraction for agent/codegen workflows using Neon’s snapshot and restore APIs. Each agent prompt produces a new checkpoint. You can jump back and forth between checkpoints to instantly revert schema and data.

This demo uses two Postgres databases:

- app database: the contacts app schema/data that evolves across prompts
- meta database: a `checkpoints` table that records the timeline of checkpoints

Key docs in this repo:

- [BRANCHING_DOCS.md](BRANCHING_DOCS.md): creating, listing, and deleting branches with the Neon API
- [SNAPSHOT_DOCS.md](SNAPSHOT_DOCS.md): creating and restoring snapshots (one-step and multi-step)
- [OPERATIONS_DOCS.md](OPERATIONS_DOCS.md): Neon control-plane operations and polling semantics

## How it works

Minimal checkpoint implementation using snapshots:

1. v1 prompt: “Create a contact list app … name + email” → app + DB created → snapshot s1

2. v2 prompt: “Add role and company” → schema + app updated → snapshot s2

3. v3 prompt: “Add tags” → schema + app updated → snapshot s3

Reverting is restoring a snapshot:

- revert to v1 → restore s1
- revert to v3 → restore s3

### App flow

- Home page → Start demo: resets both DBs and creates the first checkpoint from v1
- Checkpoint page `/[checkpointId]`:
  - Top: timeline of checkpoints with jump actions
  - Tabs: app | meta db | contacts schema
    - app: interactive contacts table (v1/v2/v3 components)
    - meta db: `checkpoints` table from the meta database
    - contacts schema: columns reported by `information_schema.columns`
  - Actions: revert (apply snapshot), update snapshot, create/jump to next
  - Next prompt: shows what the next mutation will do

### Data fetching

Checkpoint page fetches data in parallel with Promise.all:

- contacts for the current version
- contacts table schema (information_schema)
- meta `checkpoints` rows

### Applying a snapshot and waiting for operations

- `lib/neon/apply-snapshot.ts` calls Neon’s restore endpoint with `finalize_restore: true` and a `target_branch_id` (your production branch), then collects operation IDs from the response
- `lib/neon/operations.ts` polls each operation using the operations API until it reaches a terminal status (`finished`, `skipped`, or `cancelled`)

See [OPERATIONS_DOCS.md](OPERATIONS_DOCS.md) for operation semantics, and [SNAPSHOT_DOCS.md](SNAPSHOT_DOCS.md) for the restore flow.

## Environment variables

Create a `.env` file in the project root with these variables:

```env
# Contacts app database (the agent-managed app)
DATABASE_URL=postgres://user:pass@host/db

# Meta database (stores the checkpoints table)
META_DATABASE_URL=postgres://user:pass@host/db

# Neon API access for snapshot/restore and listing branches
NEON_API_KEY=your_api_key

# Neon project id (use NEON_PROJECT_ID or PROJECT_ID)
NEON_PROJECT_ID=your_project_id
# PROJECT_ID=your_project_id
```

Notes:

- `DATABASE_URL` and `META_DATABASE_URL` must point to two different Neon databases/projects or two databases in the same project, depending on your setup.
- `NEON_API_KEY` must have permission to call the [Neon API](https://neon.com/api_spec/release/v2.json) for your project.
- The app uses the `production` branch as the root branch for snapshots/restores.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 and click “Start demo”. The app will:

- reset the contacts table and the meta checkpoints table
- run the v1 mutation and create the initial snapshot
- navigate to the first checkpoint route

## Files of interest

- app/[checkpointId]/page.tsx: main page, tabs, actions, and parallel fetching
- lib/contacts.ts: schema mutations, CRUD, and contacts/schema queries
- lib/checkpoints.ts: meta DB `checkpoints` table and list/create/update
- lib/neon/branches.ts: resolves the `production` branch id via the Neon API
- lib/neon/create-snapshot.ts: creates a snapshot on the production branch
- lib/neon/apply-snapshot.ts: restore + wait for operations to finish
- lib/neon/operations.ts: polls operation ids until terminal status

## Production deployment

Deploy with your platform of choice (e.g., Vercel). Provide the same environment variables in your deployment environment.
