# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Tom Certo: PWA in pt-BR for worship teams to manage chord sheets (cifras), build setlists (playlists) and perform them fullscreen. Next.js 16 (App Router) + React 19, Prisma 6 + PostgreSQL, Auth.js v5 (Credentials, JWT), Tailwind 4 + shadcn/base-ui, Zod 4, react-hook-form, TanStack Query, dnd-kit. Domain identifiers (`titulo`, `cifra`, `tomAtual`, `ordem`, `notas`, `responsavel`) are in Portuguese; keep that naming.

## Commands

```bash
npm run dev          # next dev
npm run build        # next build
npm run lint         # eslint
npm test             # vitest run (node env)
npx vitest run lib/cifra/parser.test.ts   # single file
npx vitest run -t "name"                  # single test by name
npm run db:up        # docker compose: local postgres 16 (user/pass/db: cifras)
npx prisma migrate dev                    # apply/create migrations (uses DIRECT_URL)
npx prisma db seed                        # tsx prisma/seed.ts
```

`postinstall` runs `prisma generate`. Env (see `.env.example`): `DATABASE_URL` (pooled, runtime), `DIRECT_URL` (migrations), `AUTH_SECRET`. Tests exist only under `lib/cifra/` (parser, transpose, cfs-import).

## Architecture

- **No REST API.** All data access and mutations are Server Actions in `services/*.actions.ts` (`"use server"`), called directly from components/pages. Only `app/api/auth` exists. Actions validate input with Zod schemas from `types/schemas/*.schema.ts`, call `revalidatePath`, and take `input: unknown`.
- **Authz is per-action, not only in the proxy.** `proxy.ts` (Next 16 replacement for middleware) redirects unauthenticated users to `/login` and non-ADMIN away from `/admin`, but every Server Action must still call `requireAuth()` / `requireRole("ADMIN")` from `lib/authz.ts` first. Roles: `ADMIN`, `MEMBRO`. Song/user management is admin-only; playlists have `DRAFT`/`PUBLISHED` visibility and a `responsavel` owner.
- **Route groups:** `app/(auth)` (login) and `app/(app)` (songs, playlists, perform/[playlistId], admin, account). `perform` is the fullscreen live view; `services/perform.actions.ts` combines playlist+song+favorite in one call so client-side prev/next navigation never unmounts the viewer (unmounting exits fullscreen).
- **Cifra engine (`lib/cifra/`).** A song's `cifra` is stored as plain text (chords on a line above lyrics). `parser.ts` turns it into `ParsedLine[]` (`lyrics`, chord tokens with column, inline `isObservacao` lines), `transpose.ts` transposes by semitone diff between `tomAtual`/`tomOriginal`, `cfs-import.ts`/`import.ts` import CifraClub/CFS-style files (ZIP via jszip; bulk import). Server action body limit is raised to 15mb in `next.config.ts` for these imports.
- **Prisma schema notes:** `PlaylistSong.song` is `onDelete: Restrict` (songs in historical setlists can't be deleted), `Playlist.responsavel` is `Restrict`, tags via `SongTag` join with `connectOrCreate`. Auth.js adapter models (Account/Session/VerificationToken) are required even though sessions are JWT.
- **PWA:** `app/manifest.ts`, hand-written `public/sw.js` (precaches `/offline`, cache-first static, network-first navigation with offline fallback; served with no-cache headers via `next.config.ts`), registered by `components/providers/pwa-provider.tsx`. Bump `VERSION` in `sw.js` when changing precached assets. The proxy matcher excludes `sw.js`, `manifest.webmanifest`, `offline` and images.
- Path alias `@/*` → repo root (no `src/`). UI primitives live in `components/ui` (shadcn, `components.json`); feature components are grouped by domain in `components/<domain>/`.
