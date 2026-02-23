# System Architecture

## Purpose

This document describes the architecture of the CTC OpenAI GPT Codex Portfolio application.

## High-level view

```text
[ Browser UI ]
      |
      v
[ Next.js App Router ]
  - Page routes
  - API routes
      |
      +------------------------------+
      |                              |
      v                              v
[ Local Data Layer ]          [ OpenAI API ]
  - Cached JSON               - GPT generation
  - Demo answers              - Embeddings
  - Retrieval chunks          - Feedback scoring
      |
      v
[ Optional Supabase ]
  - Community questions
```

## Runtime components

- Frontend (React/Next.js): renders pages and interactive controls.
- API routes (Next.js server handlers): orchestrate retrieval, generation, and persistence.
- AI integration layer (`src/lib/openai.ts`): central OpenAI client creation and live/demo gating.
- Retrieval layer (`src/lib/retrieval.ts`, `src/lib/chunking.ts`): local chunk search and similarity logic.
- Domain data (`src/data/*`): precomputed demo chunks, answers, and model output caches.

## Request flow examples

### 1) RAG query flow (`POST /api/query`)

1. User submits a question from the playground UI.
2. API route validates payload and determines demo vs live mode.
3. Retrieval pipeline selects relevant chunks from local dataset.
4. In live mode, route calls OpenAI with context and generation config.
5. In demo mode, route returns deterministic fallback answer.
6. Response includes answer, sources, and metrics for UI panels.

### 2) SE trainer feedback flow (`POST /api/se-trainer/feedback`)

1. User submits interview-style answer.
2. API route builds scoring prompt with rubric/guidance points.
3. OpenAI model returns structured coaching output.
4. UI displays score, strengths, improvement points, and model answer.

### 3) Community expansion flow (`POST /api/community/expand`)

1. User clicks expand on a community question.
2. API route generates an expanded answer with OpenAI.
3. Expanded answer is returned and rendered inline.

## Module boundaries

- `src/app`: route-level pages and API handlers.
- `src/components`: reusable UI and feature-specific visual modules.
- `src/lib`: business logic, typing, retrieval, prompt construction, service clients.
- `src/data`: static/cached data for demo and visualization experiences.
- `scripts`: offline scripts for generating cached artifacts.

## Configuration and environment

Required for live AI mode:

- `OPENAI_API_KEY`

Optional integrations:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

If OpenAI key is missing, the app intentionally degrades to demo mode.

## Deployment architecture

```text
[ Vercel / Node host ]
  |
  +-- Next.js web server
        |
        +-- Route handlers (/api/*)
        +-- Static assets
        +-- Local JSON data files
        |
        +-- Outbound HTTPS to OpenAI API
        +-- Outbound HTTPS to Supabase (optional)
```

## Observability and quality posture

- Linting via `next lint`.
- Predictable demo behavior via cached JSON and deterministic fallback logic.
- Separation of concerns between UI, route handlers, and utility libraries.

## Future extension points

- Move retrieval storage from local JSON to managed vector store.
- Add structured logging and tracing in API routes.
- Introduce role-based auth for community and trainer features.
- Add automated tests for route-level contract validation.
