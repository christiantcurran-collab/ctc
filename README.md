# CTC OpenAI GPT Codex Portfolio

An interactive Next.js portfolio focused on OpenAI platform engineering, GPT model behavior, and Codex-style development workflows.

## What this project includes

- RAG playground with configurable retrieval and generation parameters
- "How AI Works" visual demo showing token probabilities and parameter effects
- Solutions Engineer trainer with documentation, MCQ quiz, and practice feedback
- Insurance dashboard demo for domain-specific AI exploration
- API routes for query, embedding, mode detection, and community question expansion

## Core capabilities

- OpenAI-powered generation and feedback endpoints
- Demo mode fallback when `OPENAI_API_KEY` is not set
- Configurable generation parameters (`model`, `temperature`, `top_p`, `max_tokens`)
- Cached educational outputs for deterministic demos
- Lightweight retrieval pipeline over preprocessed FCA content

## Tech stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui + Radix primitives
- OpenAI Node SDK (`openai`)
- Recharts for visualization

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Set environment values in `.env.local`:

- `OPENAI_API_KEY`: required for live mode
- `SUPABASE_URL`: optional, used by community features
- `SUPABASE_ANON_KEY`: optional, used by community features

4. Run development server:

```bash
npm run dev
```

5. Open:

- `http://localhost:3000/how-ai-works`

## Available scripts

- `npm run dev`: start dev server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: run Next.js lint checks

## Main routes

- `/how-ai-works`: interactive LLM parameter visualization
- `/insurance-dashboard`: insurance-focused analytics demo
- `/se-trainer`: solutions engineer practice and quiz experience
- `/playground`: RAG playground experience
- `/about`: project and stack summary

## API endpoints

- `POST /api/query`: retrieve context and generate answer
- `POST /api/embed`: generate/query embeddings in live mode
- `GET /api/mode`: returns `demo` or `live`
- `GET|POST /api/community`: community question list + creation
- `POST /api/community/expand`: expand community question with model answer
- `POST /api/se-trainer/feedback`: score and coach practice answers
- `GET /api/ingest`: ingestion capability summary endpoint

## Repository structure

```text
src/
  app/
    api/
    about/
    how-ai-works/
    insurance-dashboard/
    learn/
    playground/
    se-trainer/
  components/
    config-panel/
    how-ai-works/
    layout/
    results/
    ui/
  data/
  lib/
scripts/
```

## Operational notes

- Without `OPENAI_API_KEY`, the app stays in demo mode and uses local fallback responses.
- Cached data in `src/data/how-ai-works-cache.json` powers deterministic visual demonstrations.
- SE Trainer feedback route requires OpenAI credentials for live scoring.

## Deployment

This app is deployment-ready for Vercel or any Node-compatible host.

Recommended environment setup in production:

- `OPENAI_API_KEY`
- `SUPABASE_URL` (if community features enabled)
- `SUPABASE_ANON_KEY` (if community features enabled)

## License

This repository currently has no explicit license file. Add one if public reuse is intended.
