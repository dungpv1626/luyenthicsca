# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Luyenthicsca is a Vietnamese exam-prep platform for the CSCA (China Scholastic Competency Assessment): mock test → scoring → AI analysis → practice → retest. UI text, code comments, commit messages and the README are in Vietnamese; keep new user-facing text and commits in Vietnamese. Routes use Vietnamese slugs (`/thi-thu`, `/luyen-tap`, `/lo-trinh`, `/bang-gia`, …). The README is the detailed feature log; read the relevant section before changing a feature.

## Commands

```bash
npm run dev          # next dev on :3000 (needs .env.local, see .env.example)
npm run typecheck    # tsc --noEmit
npm test             # node --test over src/lib/*.test.ts and src/lib/templates/*.test.ts
npm run build
```
Full check before committing: `npm run typecheck && npm test && npm run build`.

- Tests use Node's built-in runner running `.ts` directly (type stripping), so test files import siblings with the `.ts` extension (`import { x } from "./plans.ts"`). Run one file: `node --test src/lib/plans.test.ts`. Filter by name: add `--test-name-pattern "<regex>"`.
- Only pure logic in `src/lib` is tested; keep testable logic free of Supabase/Next imports (e.g. `journey.ts` pure vs `journey-data.ts` DB fetching, `plans.ts` pure vs `entitlement.ts` DB).
- Maintenance scripts in `scripts/` run against the real DB: `node --env-file=.env.local scripts/<name>.mjs` (question generation, template variants, building sim/level exams, module backfill, SEO import, AI spend ledger). Most support `--dry`; prefer it first.

## Architecture

- **Next.js 16 App Router + React 19, TypeScript, Tailwind v4.** Next APIs differ from older versions (see AGENTS.md). The project deliberately uses `src/middleware.ts` (not `proxy.ts`) to refresh the Supabase session because it is more stable on Cloudflare; it also sets an `x-pathname` header and skips `/api/payment`.
- **Mutations are Server Actions** in `src/app/*-actions.ts` (`actions.ts`, `exam-actions.ts`, `order-actions.ts`, `plan-actions.ts`, `tutor-actions.ts`, …) and `src/app/admin/*actions.ts`. The only API route is the payment webhook `src/app/api/payment/webhook/route.ts`.
- **Supabase, two clients:** `src/lib/supabase/server.ts` (cookie/session-bound, used for auth) and `src/lib/supabase/admin.ts` `adminDb()` (service role, bypasses RLS). Almost all data access goes through `adminDb()`, so authorization is enforced in code: `getMe`/`requireMe` and role checks via `ADMIN_AREAS` in `src/lib/auth.ts` (5 admin roles + student). The `questions` table has no RLS policies; correct answers must never be sent to the browser during an exam (`src/lib/exam.ts`, `ExamRunner`).
- **Schema** lives in ordered SQL files `supabase/migrations/NNNN_*.sql`, applied manually in the Supabase SQL editor (no migration tool). New schema change = new numbered file; mention in the README that it must be run.
- **Exams:** `exam.ts` picks questions, creates/submits attempts; `scoring.ts` computes Readiness Score (80% weighted accuracy + 20% speed); `sim.ts` handles CSCA-format simulation exams (scaled to 100); `levels.ts` defines practice levels 1–4 with difficulty mixes; `assemble.ts` / `assemble-modules.ts` assemble exams by difficulty mix / syllabus-module quotas (`syllabus.ts`).
- **Question bank:** AI-generated questions (always land in a review queue, never auto-approved) plus parametric templates in `src/lib/templates/` (`add({ key, subject, topic, subtopic, difficulty, build })`; answers and distractors computed in code, text in Vietnamese/English/Chinese; `build` returns `null` for invalid params). Math uses LaTeX `$...$` rendered by KaTeX; avoid `\,` in Markdown content (use `\ `).
- **AI (Claude via `@anthropic-ai/sdk`):** `src/lib/ai.ts` always has a rule-based fallback (`ruleReport`) when there's no API key or the call fails. Model comes from `ANTHROPIC_MODEL`. Spend is tracked in the `ai_spend` table.
- **Monetization:** yearly plans Free/Starter/Pro/Max in `src/lib/plans.ts`; an active plan is derived from `paid` orders with `plan` and `paid_at + 365 days` (`src/lib/entitlement.ts`), no separate subscriptions table. Paid tests (`price_vnd > 0`) unlock with Starter+. Payment is VietQR bank transfer with order code `LTCxxxxxx`; `markOrderPaid()` in `src/lib/orders.ts` is the single place that marks orders paid (webhook or admin manual confirm).
- **Styling:** design tokens are defined in `@theme` in `src/app/globals.css` (`brand`, `navy`, `ink`, `canvas`, `surface`, `muted`, `success`/`warning`/`danger`, …) with light/dark theming; use token classes, not hard-coded colors.
- **Blog/SEO:** content from `content/seo/*.json` imported as drafts; `reviewFlags` in `src/lib/blog-utils.ts` blocks publishing posts with placeholders. Canonical site URL is fixed in `src/lib/seo.ts`.

## Deployment (Cloudflare Workers via OpenNext)

- `npm run cf:preview` (local workerd; secrets in `.dev.vars`), `npm run cf:deploy` (needs `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`).
- OpenNext bakes every `.env*` file into the bundle, so `scripts/cf-deploy.mjs` temporarily moves `.env.local` aside and exposes only `NEXT_PUBLIC_*`. Don't bypass it with a raw `opennextjs-cloudflare deploy`. Secrets are set with `npx wrangler secret put <NAME>`; non-secret vars live in `wrangler.jsonc`. `NEXT_PUBLIC_*` values are inlined at build time.
- Production needs the Workers Paid plan (free-tier CPU/size limits are too low).
