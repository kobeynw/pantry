# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working style

The owner is learning this tech stack and prefers to **write the code themselves** as a learning exercise. Default to guiding — explain what needs to change and why, show small illustrative snippets, and let them implement — rather than making edits directly. Only write code into the repo when they explicitly ask.

## What this project is

Personal pantry management web app — manage food inventory, recipes, and shopping lists. Core loop: stock pantry → browse recipes → cook → auto-update inventory → generate shopping list.

Self-hosted on a Proxmox LXC container, accessed over home WiFi and Tailscale VPN.

## Repository layout

```
backend/    FastAPI (Python 3.14, uv)
frontend/   React + Vite + TypeScript
docs/       Design decisions and implementation plan
```

## Commands

### Backend (run from `backend/`)

```bash
uv run uvicorn main:app --reload      # dev server on :8000
uv run pytest                         # run all tests
uv run pytest tests/test_foo.py       # run a single test file
uv run ruff check .                   # lint
uv run ruff format .                  # format
alembic upgrade head                  # apply migrations
alembic revision --autogenerate -m "description"  # generate migration
```

### Frontend (run from `frontend/`)

```bash
npm run dev       # dev server on :5173
npm run build     # tsc + vite build
npm run lint      # eslint
```

## Backend architecture

The backend is early-stage. The planned structure (inside `backend/`) is:

```
main.py          FastAPI entry point (currently has the app instance + health endpoint)
app/
  db.py          SQLite engine + session management (WAL mode enabled at startup)
  models/        SQLModel entity definitions
  routers/       FastAPI router modules per resource
  services/      Business logic (cook flow, etc.)
alembic/         Database migrations
tests/
```

**SQLModel** is used for all entities — one class definition serves both the Pydantic API schema and the SQLAlchemy ORM model.

**Unit handling** is a core invariant: all quantities are stored in canonical units (grams for weight, milliliters for volume, integer count for count items). Each row also stores the original `display_unit` the user entered so the UI can render values in familiar units. **Conversion runs on the frontend** using the `convert` TypeScript library: the client converts the user-entered value to canonical units before sending it to the API, and converts canonical values back to the display unit for rendering. The backend stores and compares canonical numbers only — it performs no unit conversion. Cross-type conversion (e.g. cups ↔ grams) is explicitly out of scope.

When a recipe is cooked, pantry quantities are decremented. If the pantry has less than required, the quantity is zeroed (never goes negative). A `CookingEvent` + `CookingEventIngredient` snapshot is written to preserve the exact amounts subtracted — recipe edits must not retroactively change history.

## Frontend architecture

React 19 + Vite + TypeScript. **Tailwind CSS v4** (configured via `@tailwindcss/vite` plugin, not `tailwind.config.js`) and **DaisyUI** for component styling. No routing library is installed yet; the implementation plan calls for `react-router`.

**Unit conversion lives here**, not on the backend: the `convert` library handles all weight↔weight and volume↔volume conversion. The client validates that the entered unit matches the ingredient's `measurement_type`, converts to canonical units before POSTing, and converts back to the stored `display_unit` when rendering.

The app must be mobile-first — designed for iPhone Safari with touch-friendly targets.

The plan calls for `openapi-typescript` to generate TypeScript types from FastAPI's OpenAPI spec (`/openapi.json`), avoiding duplicated type definitions across the stack.

## Data model overview

Eight entities: `Ingredient` (the catalog), `PantryItem`, `Recipe`, `RecipeIngredient`, `ShoppingList`, `ShoppingListItem`, `CookingEvent`, `CookingEventIngredient`. All pantry/recipe/shopping entries reference `Ingredient` by ID. Shopping lists and recipes have no persistent link — recipes only inform what gets added to a list.

See `docs/pantry_app_design.md` for the full entity field list and behavioral rules.

## Deployment target

Proxmox LXC container with static LAN IP. Backend runs as a systemd service (uvicorn on :8000), frontend is a static build served on :3000. Pi-hole DNS provides `pantry.home` alias on the LAN. Tailscale provides remote access.
