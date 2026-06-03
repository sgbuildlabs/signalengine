# Signal Engine

Sprint 1 delivers a usable Run Sandbox slice:
- Next.js UI with server action to trigger synthetic deterministic run.
- API endpoint `POST /api/runs/enqueue`.
- Supabase migration scaffold with RLS on core domain tables.
- Deterministic Phase 0 math functions and synthetic unit tests.
- No-Supabase fallback mode: the sandbox returns deterministic results with `storageMode: "ephemeral"` when Supabase env vars are absent.

## Setup
```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` with your Supabase values when persistence is needed. The sandbox runs without them.

## Run
```bash
npm run dev
```
Open `http://localhost:3000`.

## Tests
```bash
npm run typecheck
npm test
npm run build
```

## Supabase local
```bash
supabase start
supabase db reset
```

## Sprint log
- Sprint 0: design docs in `docs/`.
- Sprint 1: scaffold + synthetic deterministic run path + CI.
