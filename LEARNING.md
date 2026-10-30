# Idea Circles — Learning & Interview Log 🎓

This document records the architecture decisions, file responsibilities, and key engineering concepts learned while building **Idea Circles** from scratch.

---

## Phase 1: Project Setup & Next.js App Router Architecture

### What Was Built
- Initialized Next.js 16 with TypeScript and Tailwind CSS using the modern App Router.
- Set up a minimal root layout, landing page with branding and feature previews, and a secure `.gitignore` to prevent secret leaks.

### What Each File Does
- **`src/app/layout.tsx`**: The global HTML shell wrapping every route. Defines global fonts, styles, and `<title>` / `<meta>` tags.
- **`src/app/page.tsx`**: The public landing page (`/`) introducing Idea Circles, core lifecycle concepts, and navigation entry points.
- **`src/app/globals.css`**: Tailwind CSS theme import and custom CSS variables.
- **`.gitignore`**: Explicitly ignores `.env*` and `.env.local` to prevent database secrets and API keys from leaking to Git.

### 💡 One Thing to Explain in an Interview
> **"What is the difference between Next.js Pages Router and App Router?"**
> "In the Pages Router, every component in `pages/` was rendered on both client and server with `getServerSideProps` or `getStaticProps`. In the modern **App Router** (built on React Server Components), components are Server Components by default. They execute exclusively on the server, producing zero JavaScript bundle weight in the browser, can safely fetch data without exposing backend secrets, and only ship client JavaScript when explicitly marked with `'use client'`."

---

## Phase 2: Relational Data Model & Row Level Security (RLS)

### What Was Built
- Designed the relational PostgreSQL schema in `supabase/schema.sql` covering 6 tables: `profiles`, `ideas`, `circles`, `circle_members`, `idea_shares`, and `idea_updates`.
- Configured PostgreSQL Row Level Security (RLS) policies on every single table to enforce authorization at the database level.
- Wrote database triggers: `handle_new_user()` (auto-creates profiles on signup) and `handle_circle_created()` (auto-adds creator to circle members).
- Wrote the PostgreSQL atomic function `join_circle_with_code()` with `SECURITY DEFINER`.

### What Each File Does
- **`supabase/schema.sql`**: Complete database script containing all DDL table definitions, foreign keys, cascade deletes, RLS policies, trigger procedures, and helper functions.

### 💡 One Thing to Explain in an Interview
> **"Why use database-level Row Level Security (RLS) instead of traditional API-level checks?"**
> "In traditional web architectures, if a developer forgets an authorization check in one API endpoint (like `WHERE user_id = currentUser.id`), private data is exposed. With **PostgreSQL Row Level Security**, authorization rules are baked directly into the database engine. Even if an attacker tampers with client code, calls Supabase directly, or a developer writes a simple `SELECT * FROM ideas`, PostgreSQL physically filters the returned rows according to `auth.uid()`. It provides defense-in-depth where authorization cannot be bypassed by application-level mistakes."

---

## Phase 3: Supabase Auth & Protected Routes

### What Was Built
- Connected Supabase Auth using the official `@supabase/ssr` package with HTTP-only cookies.
- Built login and signup with email and password, automatic profile creation, logout, and route protection middleware.

### What Each File Does
- **`src/lib/supabase/client.ts`**: Creates a Supabase client for browser Client Components.
- **`src/lib/supabase/server.ts`**: Creates a Supabase client for Server Components and Server Actions using asynchronous `cookies()`.
- **`src/lib/supabase/middleware.ts` & `src/middleware.ts`**: Next.js middleware that validates session tokens and bounces unauthenticated users away from `/dashboard`, `/ideas`, and `/circles`.
- **`src/app/auth/actions.ts`**: Server Actions for `login`, `signup`, and `logout`.
- **`src/app/login/page.tsx`**: Interactive form with real-time feedback and state toggling.
- **`src/app/dashboard/page.tsx`**: Protected dashboard page verifying server session and displaying user profile data.

### 💡 One Thing to Explain in an Interview
> **"How does cookie-based authentication work across Server and Client Components in Next.js?"**
> "Local storage is insecure because client-side JavaScript (and XSS attacks) can read tokens, and Server Components cannot access `localStorage`. Using `@supabase/ssr`, tokens are stored in **HTTP-only cookies**. The browser automatically sends these cookies with every HTTP request. Server Components read them using `cookies()`, Server Actions mutate them, and Next.js Middleware refreshes expired JWT tokens in flight before routes render."

---

## Phase 4: Ideas CRUD with Lifecycle Statuses

### What Was Built
- Full Create, Read, Update, and Delete operations for ideas.
- Structured idea lifecycle tracking with 5 valid statuses: `spark`, `exploring`, `building`, `shipped`, `parked`.
- Interactive filter pills on the dashboard with live idea counts.

### What Each File Does
- **`src/lib/types.ts`**: TypeScript definitions for `Idea`, `IdeaStatus`, and badge theme configs.
- **`src/components/StatusBadge.tsx`**: Visual badge component with status-specific colors.
- **`src/app/ideas/actions.ts`**: Server Actions for `createIdea`, `updateIdea`, and `deleteIdea`.
- **`src/app/ideas/new/page.tsx`**: Form to capture a new idea.
- **`src/app/ideas/[id]/edit/page.tsx` & `src/components/EditIdeaForm.tsx`**: Form to edit title, description, advance status, or delete.
- **`src/components/DashboardIdeas.tsx`**: Interactive idea list with status filter pills.

### 💡 One Thing to Explain in an Interview
> **"What are Next.js Server Actions and why use them for CRUD?"**
> "Server Actions are asynchronous functions that run exclusively on the server. Instead of creating traditional API endpoints (`/api/ideas`) and manually fetching with `fetch()` and `useEffect()`, Server Actions can be invoked directly from HTML forms or buttons. They automatically handle serialization, support progressive enhancement, and allow cache revalidation (`revalidatePath`) in one clean function call."

---

## Phase 5: Circles & Invite Code System

### What Was Built
- Private circles where friends and teams can group together.
- Random, unguessable 8-character invite code generation.
- Atomic join-by-code operation and circle membership management with leave functionality.

### What Each File Does
- **`src/app/circles/actions.ts`**: Server Actions for `createCircle`, `joinCircle`, and `leaveCircle`.
- **`src/components/CopyButton.tsx`**: Clipboard utility button to share invite codes.
- **`src/components/LeaveCircleButton.tsx`**: Action button with confirmation modal to leave a group.
- **`src/app/circles/page.tsx`**: Overview listing all circles a user belongs to.
- **`src/app/circles/new/page.tsx`**: Circle creation page.
- **`src/app/circles/join/page.tsx`**: Code input page to join an existing circle.
- **`src/app/circles/[id]/page.tsx`**: Single circle hub displaying the invite code, member roster, and creator badges.

### 💡 One Thing to Explain in an Interview
> **"What is `SECURITY DEFINER` in PostgreSQL and why is it needed for invite codes?"**
> "By default, a PostgreSQL function runs with the privileges of the user executing it (`SECURITY INVOKER`). However, when a user who is not yet a circle member enters an invite code, RLS prevents them from reading the `circles` table. By declaring `join_circle_with_code` as `SECURITY DEFINER`, the function temporarily executes with the permissions of the database owner. It safely looks up the circle matching the code and inserts the user into `circle_members` without granting the user broad read access to all private circles."

---

## Phase 6: Idea Sharing, Progress Notes & Circle Feed

### What Was Built
- Selective sharing: idea owners can share an idea with one or more of their circles.
- Dated progress notes: chronological milestone updates posted by the idea owner and visible to circle members.
- Aggregated Circle Idea Feed: lists every shared idea in a circle with its status and latest note.

### What Each File Does
- **`src/components/ShareIdeaManager.tsx`**: Checkbox list allowing the owner to toggle sharing across their circles.
- **`src/components/ProgressNotesSection.tsx`**: Chronological notes timeline with posting form for owners and read-only mode for members.
- **`src/app/ideas/[id]/page.tsx`**: Comprehensive idea page showing details, sharing controls, and progress notes.
- **`src/app/circles/[id]/page.tsx`**: Updated circle feed querying `idea_shares` and matching each idea with its latest note.

### 💡 One Thing to Explain in an Interview
> **"How do you query related records in Supabase and prevent N+1 query problems?"**
> "PostgreSQL and PostgREST support nested foreign key joins in a single query. Instead of querying circles, then looping through each idea with separate queries (the N+1 problem), we write:
> `supabase.from('idea_shares').select('idea_id, ideas(*, profiles(*))').eq('circle_id', id)`
> This produces a single optimized SQL join on the database, reducing database roundtrips from $N+1$ to $1$."

---

## Phase 7: Polish, Error Boundaries, Tests & Permissions

### What Was Built
- Responsive mobile layouts across phone viewports (360px+).
- Next.js skeleton loading states, error boundaries, and custom 404 pages.
- Client and server-side form validations with character counters.
- Automated security test suite (`tests/permissions.test.mjs`) verifying all permission invariants.

### What Each File Does
- **`src/app/loading.tsx`**: Skeleton loading animation displayed during route transitions.
- **`src/app/error.tsx`**: Error boundary with graceful error recovery.
- **`src/app/not-found.tsx`**: Custom 404 screen for missing or unauthorized pages.
- **`tests/permissions.test.mjs`**: Automated Node.js test suite verifying RLS invariants (owner rights, member visibility, non-member rejection).
- **`README.md`**: Complete documentation with Mermaid ER diagrams and setup guides.

### 💡 One Thing to Explain in an Interview
> **"How does Next.js App Router handle loading and error states out of the box?"**
> "Next.js uses a file-system convention based on React Suspense and Error Boundaries:
> - `loading.tsx` wraps the route's `page.tsx` inside a React `<Suspense fallback={<Loading />}>`. It instantly shows a skeleton without waiting for the server fetch to complete.
> - `error.tsx` wraps the segment in a React Error Boundary (`'use client'`). If a server action or fetch throws an unhandled exception, `error.tsx` catches it, prevents the white screen of death, and offers a `reset()` method to retry."
