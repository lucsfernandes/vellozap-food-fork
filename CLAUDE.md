# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VellozapFood is a restaurant management SaaS platform (Brazilian market) with WhatsApp integration for ordering. It provides a public-facing digital menu, a restaurant owner dashboard, and team/employee management. Originally scaffolded with Lovable.dev.

## Commands

- `npm run dev` — start dev server on port 8080
- `npm run build` — production build
- `npm run build:dev` — development build
- `npm run lint` — ESLint check
- `npm run preview` — preview production build

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite (SWC), React Router v6
- **Styling**: Tailwind CSS 3 with shadcn/ui (default style, CSS variables, `@/components/ui/`)
- **State/Data**: TanStack React Query, Supabase (auth + Postgres + storage)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

## Architecture

**Path alias**: `@/` maps to `src/` (configured in vite.config.ts and tsconfig).

**Routing** (src/App.tsx): `/` landing, `/auth` login/signup, `/menu` public menu, `/dashboard` restaurant owner dashboard, `/contact` contact page.

**Supabase integration** (`src/integrations/supabase/`):
- `client.ts` — auto-generated Supabase client (do not edit manually)
- `types.ts` — auto-generated database types (do not edit manually)
- Database tables: `restaurant_profiles`, `products`, `orders`, `order_items`, `employees`, `employee_work_records`, `employee_payments`, `onboarding_progress`, `operating_hours`
- All tables use RLS scoped to the authenticated user
- Migrations live in `supabase/migrations/`

**Auth flow**: `useAuth` hook wraps Supabase auth state. `ProtectedRoute` component guards `/dashboard`. New users go through an onboarding flow (`OnboardingCheck` → `OnboardingFlow` with step components in `src/components/onboarding/`).

**Dashboard** (`RestaurantDashboard.tsx`): Tab-based layout with orders, menu management, promotions, team, WhatsApp chat, settings, and export. Heavy component — most dashboard features are split into dedicated components in `src/components/`.

**Currency**: Brazilian Real (BRL) formatting via `src/utils/currency.ts` using `formatCurrency`.

## Key Conventions

- UI components from shadcn/ui live in `src/components/ui/` — add new ones via `npx shadcn-ui@latest add <component>`
- Custom hooks in `src/hooks/` (useAuth, useRestaurantProfile, useOnboarding, useDeliveryCalculator)
- The codebase is in English (code) with Portuguese (pt-BR) user-facing strings
- `@typescript-eslint/no-unused-vars` is disabled in eslint config
