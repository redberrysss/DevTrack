# DevTrack

**Build. Track. Showcase.** A developer workspace that keeps your projects, their tasks, your progress and your
public GitHub activity in one place — with no placeholder data anywhere.

- **Stack:** React 19 · TypeScript (strict) · Vite 8 (Rolldown) · Tailwind CSS 4 · Firebase (Auth, Firestore, Storage) · Recharts
- **Tests:** Vitest + Testing Library (72 tests)
- **Accessibility:** keyboard-navigable, focus-managed modals, skip links, ARIA live regions, colour never used alone
- **Themes:** light / dark / follow-system, applied before first paint

---

## Table of contents

1. [Features](#features)
2. [Quick start](#quick-start)
3. [Firebase setup](#firebase-setup)
4. [Deploying the security rules](#deploying-the-security-rules)
5. [Environment variables](#environment-variables)
6. [Data model](#data-model)
7. [GitHub integration](#github-integration)
8. [Available scripts](#available-scripts)
9. [Project structure](#project-structure)
10. [Architecture notes](#architecture-notes)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Features

| Area | What it does |
| --- | --- |
| **Authentication** | Email/password sign-up and sign-in, password reset, password change, display-name sync, email verification with resend. |
| **Dashboard** | Real statistics computed from Firestore (status counts, average progress, task completion) plus live GitHub numbers and three charts. |
| **Projects** | Full CRUD with description, category, status, technology tags, live/repository/image URLs, dates, progress mode and a per-project timeline. |
| **Search & filter** | Live text search over name, description, category and technologies, combined with status/category filters and five sort orders. |
| **Tasks** | Create, edit, complete, and delete tasks per project. Completing a task can update the project's progress atomically in the same batch. |
| **GitHub** | Public profile + repository lookup, cache, language breakdown, repository search/filter/sort, connect and disconnect a username. |
| **Profile** | Bio, location, skills, education and experience entries, avatar upload/removal, social links. |
| **Settings** | Account details, theme selection, GitHub connection, password change, sign-out, data & privacy summary. |
| **Marketing pages** | Landing page, clearly labelled sample demo, privacy policy, terms of service, 404. |
| **Safety** | Firestore + Storage rules, per-user data isolation, friendly error mapping, no secrets in the bundle. |

---

## Quick start

```bash
npm install
cp .env.example .env.local     # add your Firebase values (see below)
npm run dev                    # http://localhost:5173
```

If `.env.local` has no Firebase keys, the app renders a **"Connect Firebase to continue"** screen with step-by-step
instructions instead of failing. Nothing else is required to explore the marketing pages, the demo and the 404 page.

---

## Firebase setup

1. **Create a project** at <https://console.firebase.google.com>.
2. **Enable Email/Password** — Authentication → Sign-in method → Email/Password → Enable.
3. **Create a Firestore database** — Firestore Database → Create Database → **production mode** (the security rules
   deny all access until they are deployed, so do not skip this).
4. **Create a Storage bucket** (needed for avatar uploads) — Storage → Get started.
5. **Register a web app** — Project settings → General → Your apps → Web → copy the config object.
6. **Fill in `.env.local`** with the values from step 5:

   ```dotenv
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
   ```

7. Restart the dev server (`npm run dev`) — Vite only reads `.env.local` at startup.

> The Firebase web config is **public by design**. It ships in the JavaScript bundle for every client. What protects
> the data is Firebase Authentication plus the security rules below, not the obscurity of these keys.

---

## Deploying the security rules

The rules in this repository are part of the product: without them the database is wide open. Deploy them with the
Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use --add                 # select your project id

# One-time: create firebase.json pointing at the local rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

`firebase.json` is already in the repository: it points the emulator and the deploy CLI at `firestore.rules` and
`storage.rules`, serves `dist/` for Hosting with an SPA rewrite, and sets immutable caching for hashed assets.

**Verify the rules are live** (Firestore → Rules tab, or):

```bash
firebase firestore:rules:get firestore.rules | head -20
```

### What the rules guarantee

- Every read and write requires authentication; an anonymous client gets nothing.
- A user can only touch documents under their own `users/{uid}` path.
- Collection-group task reads are authorised by `resource.data.userId == request.auth.uid`, which is why every task
  document carries a `userId` field.
- Profiles cannot be deleted through the client API, and their email/creation timestamp are immutable.
- Project and task writes are restricted to an explicit key whitelist with type and length checks, so a compromised
  client cannot inject arbitrary fields.
- Storage is limited to `users/{uid}/…`, images only, under 2 MB.

---

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase web config. |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase web config. |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase web config. |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase web config (avatar uploads). |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase web config. |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase web config. |
| `VITE_FIREBASE_MEASUREMENT_ID` | ➖ | Only if you enabled Analytics. |
| `VITE_GITHUB_USERNAME` | ➖ | Pre-fills the GitHub username on `/github` and shows live data on the landing/demo pages. |
| `VITE_GITHUB_PROXY_URL` | ➖ | Server-side proxy for GitHub requests (see below). |
| `VITE_SITE_GITHUB_URL` | ➖ | Footer social link. Nothing renders when empty — no dead links. |
| `VITE_SITE_LINKEDIN_URL` | ➖ | Footer social link. |
| `VITE_SITE_X_URL` | ➖ | Footer social link. |

All `VITE_*` variables are embedded in the client bundle and are public. **Never** put a GitHub token, an admin
service-account key or any other secret in this file. `.env.local` and `.env*` are git-ignored.

---

## Data model

```
users/{uid}                                     profile document
users/{uid}/projects/{projectId}                project document
users/{uid}/projects/{projectId}/tasks/{taskId} task document
```

Dates that the user picks (project start/end, education years) are stored as ISO strings (`2025-04-14`).
Server-generated timestamps (`createdAt`, `updatedAt`, `completedAt`) use `serverTimestamp()`.

Every project and task document also stores `userId`, which is what makes the dashboard's single collection-group
task listener authorisable.

---

## GitHub integration

- The app calls the **public GitHub REST API** (`/users/{username}` and `/users/{username}/repos`). No token is
  required and no token is ever shipped to the browser.
- Anonymous GitHub allows **60 requests per hour per IP**. Responses are therefore cached in memory and in
  `sessionStorage` for **5 minutes** (`GITHUB_CACHE_TTL_MS`), and in-flight requests are shared and abortable.
- Rate-limit responses are detected from the `X-RateLimit-*` headers and surfaced as a clear message rather than a
  generic failure.
- If your deployment gets closer to the limit, point `VITE_GITHUB_PROXY_URL` at a server-side proxy that holds a
  `GITHUB_TOKEN` **in the server environment**. The token never reaches the client.
- Nothing is ever written back to GitHub, and private repositories are never accessible.

---

## Available scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR. |
| `npm run build` | Type-checks (`tsc -b`) and builds the production bundle into `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | ESLint 9 flat config, including the React Compiler rules. |
| `npm run typecheck` | Type-checks without emitting. |
| `npm test` | Runs the Vitest suite once. |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run verify` | Type-check → lint → test → build. Run this before shipping. |

---

## Project structure

```
src/
├── components/
│   ├── charts/      Recharts wrappers (status pie, task pie, language bar)
│   ├── dashboard/   Stat cards and dashboard widgets
│   ├── github/      Profile card and repository list
│   ├── layout/      Sidebar, topbar, mobile nav, page header, logo
│   ├── profile/     Avatar upload and the profile editor
│   ├── projects/    Project form/card/filters, task list, timeline
│   ├── system/      SetupRequired screen
│   └── ui/          Buttons, forms, modal, toast, badges, states, brand icons
├── config/          Site metadata and navigation
├── contexts/        Auth, Theme, Toast providers (+ their context objects)
├── hooks/           useAuth, useProjects/useTasks/useAllTasks, useGithubUser, …
├── layouts/         App, Auth and Marketing shells
├── lib/             Pure logic: stats, filters, demo dataset
├── pages/           One folder per route area
├── routes/          Route table and guards
├── services/        Firebase (auth/profile/storage), projects, tasks, GitHub
├── test/            Vitest setup + suites
├── types/           Shared TypeScript types
└── utils/           Validation, formatting, error mapping, constants
```

---

## Architecture notes

- **Contexts are split** into `XContext.ts` (the context object) and `XProvider.tsx` (the component) so that fast
  refresh keeps working and hooks can be imported without pulling in the provider tree.
- **Firestore and GitHub loading state is derived, not set in effects.** `useProjects`/`useTasks`/`useAllTasks` and
  `useGithubUser` store their snapshot keyed by the active subscription, so a new user, project or refresh reports
  `loading` during render. This keeps the `react-hooks` compiler rules satisfied and avoids cascading renders.
- **Modals own their submit state** (`ProjectFormModal`) and restore focus to the trigger on close; the `Modal`
  component traps Tab, closes on Escape and locks body scroll.
- **Routes are lazy-loaded.** Vite 8 (Rolldown) splits `react`, `charts` and Firebase per product, and the Firebase
  clients are isolated in their own modules (`firestoreClient.ts`, `storageClient.ts`, and an on-demand import of the
  profile module) so a signed-out marketing visitor downloads the auth SDK only — not Firestore (130 kB gzip) or
  Storage. Initial JS for a landing-page visit is ~130 kB gzip instead of ~266 kB.
- **Error handling is centralised** in `getFriendlyError`, which maps Firebase/GitHub codes to human text and never
  renders a raw internal string.
- **The demo dataset** (`src/lib/demoData.ts`) is a fixed, clearly labelled sample used only by `/demo`. It is never
  imported by the app, the dashboard or any Firestore call.

---

## Testing

```bash
npm test
```

The suite covers:

- **Validation** — email/username/URL/date/password rules, every form, profile, education and experience entries.
- **Data logic** — project and task statistics, status chart mapping, project search/filter/sort, GitHub summaries,
  language counts, repository filtering, and the consistency of the demo dataset.
- **Components** — status badges (label + colour), progress bars (`aria-valuenow`), error/empty/inline states, the
  tag input add/remove flow, and the chart empty states.
- **App shell** — marketing landing page, demo labelling, 404, legal pages, the unconfigured-Firebase screen, theme
  switching and persistence, toast rendering, and the error-message mapper.
- **Auth screens** — anonymous redirect to `/login`, sign-in and registration client-side validation, password rules,
  password-reset request, and a friendly message when Firebase rejects the credentials.
- **Repository hygiene** — asserts that no compiler output shadows the TypeScript sources, that there is exactly one
  Vite config, and that no real environment file is committed.

> **Why the hygiene tests exist:** a `tsc` run that emits next to the sources creates `src/**/*.js` files, and Vite
> resolves `.js` **before** `.ts`/`.tsx`. The app then builds from a stale copy of every module while the type-checker
> and the tests read the real sources — a failure that is invisible until you inspect the built output. The `typecheck`
> script is plain `tsc -b` (both tsconfigs set `noEmit`), `.gitignore` blocks the emitted files, and a test enforces it.

---

## Deployment

Any static host works — `npm run build` emits a fully static `dist/`.

```bash
npm run build
# copy dist/ to your host (Vercel, Netlify, Cloudflare Pages, Firebase Hosting, S3…)
```

Remember to:

1. Set the `VITE_*` variables in the host's build environment.
2. Deploy the Firestore and Storage rules.
3. Add your own domain to the Firebase **authorized domains** list (Authentication → Settings) and to
   `VITE_SITE_*` links if you want them in the footer.
4. Nothing else for Firebase Hosting — the SPA rewrite is already configured.

```bash
firebase deploy --only hosting
```

Other static hosts just need `dist/` plus a 404 → `index.html` rewrite.

---

## Troubleshooting

**"Connect Firebase to continue"** — the app is running without a Firebase configuration. Copy `.env.example` to
`.env.local`, fill in the six `VITE_FIREBASE_*` values and restart the dev server.

**`permission-denied` on reads/writes** — the security rules are not deployed, or they are deployed for a different
project. Run `firebase deploy --only firestore:rules,storage` and confirm the active project with `firebase use`.

**Account created in the Firebase console has no profile** — not a problem: the app creates the profile document the
first time such an account signs in.

**GitHub shows a rate-limit message** — expected on the anonymous 60/hour limit. Wait for the reset, or configure
`VITE_GITHUB_PROXY_URL`.

**Avatar upload fails** — check that the Storage bucket exists, the rules are deployed, and the file is an image under
2 MB.

**Charts are empty on the dashboard** — the charts render only when there is data: add a project or connect a GitHub
account with public repositories.

---

## License

Personal project. Add your own license before publishing.
