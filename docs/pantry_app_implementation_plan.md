# Pantry App — Implementation Plan

> High-level roadmap for building and deploying the pantry app, organized into feature slices that each deliver end-to-end functionality.

---

## 1. Prerequisites & Tooling

Set up the dev machine with everything needed before writing any code.

- Install **Python 3.12+**
- Install **uv** (Python package manager)
- Install **Node.js** (LTS) and **npm**
- Install **git** and configure GitHub credentials
- Install / configure **VS Code** with Python and TypeScript extensions
- Verify all versions on the command line

**User-facing criteria:** N/A — environment is ready to develop.

---

## 2. Repository Setup

Establish the monorepo on GitHub.

- Create a new GitHub repo (monorepo)
- Clone locally
- Initial directory structure:
  ```
  /backend         FastAPI app
  /frontend        React app
  /docs            design + plan markdown
  README.md
  .gitignore
  ```
- Add a top-level README explaining the project
- Configure `.gitignore` for both Python and Node artifacts

**User-facing criteria:** N/A — repo exists with structure.

---

## 3. Backend Scaffolding

Get a minimal FastAPI server running with SQLite + Alembic ready for migrations.

- Initialize Python project with `uv init` in `/backend`
- Install dependencies: `fastapi`, `uvicorn`, `sqlmodel`, `alembic`, `pint`, `pytest`
- Project structure inside `/backend`:
  ```
  app/
    main.py          FastAPI entry point
    db.py            engine / session management
    models/          SQLModel entities
    routers/         API route modules
    services/        business logic
  alembic/           migrations
  tests/
  ```
- Implement a `/health` endpoint to verify uvicorn runs
- Configure SQLite connection with **WAL mode** enabled at startup
- Initialize Alembic (`alembic init`) and point it at the SQLModel metadata

**User-facing criteria:** Backend runs on `http://localhost:8000` and `/health` returns OK.

---

## 4. Frontend Scaffolding

Get a minimal React app running with the basic UI shell in place.

- Scaffold app with **Vite + React + TypeScript** in `/frontend`
- Install and configure **Tailwind CSS** and **shadcn/ui**
- Set up mobile-first base styles and a top-level layout shell (header, content area, mobile nav)
- Create an API client utility (fetch wrapper pointing at the backend)
- Install **openapi-typescript** and add a script to generate TS types from the backend's OpenAPI spec
- Set up routing (e.g. `react-router`) with placeholder routes for the main screens

**User-facing criteria:** Frontend runs on `http://localhost:5173` and displays an empty app shell on desktop and mobile.

---

## 5. Feature Slice 1 — Ingredients (Catalog)

The foundational entity — everything else references ingredients.

**Backend:**
- Define `Ingredient` SQLModel (name, measurement_type, default_unit)
- Generate Alembic migration and apply it
- CRUD endpoints: `GET /ingredients`, `POST /ingredients`, `GET /ingredients/{id}`, `PATCH /ingredients/{id}`, `DELETE /ingredients/{id}`

**Frontend:**
- Ingredient list screen
- Add/edit ingredient form (name, measurement type, default unit)
- Delete confirmation

**User-facing criteria:** User can add, view, edit, and remove ingredients in the catalog.

---

## 6. Feature Slice 2 — Pantry

Track what's currently in stock, with unit conversion handled by Pint.

**Backend:**
- Define `PantryItem` SQLModel (ingredient_id, quantity_canonical, display_unit)
- Migration + apply
- CRUD endpoints for pantry items
- Service layer: convert user-entered unit → canonical unit using **Pint** before saving
- Validate that the entered unit matches the ingredient's `measurement_type`

**Frontend:**
- Pantry screen showing current stock grouped by ingredient
- Add/edit pantry item form (pick ingredient, enter quantity + unit)
- Quantities display in the unit originally entered

**User-facing criteria:** User can add items to the pantry, see current stock, edit quantities, and remove items.

---

## 7. Feature Slice 3 — Recipes

Store recipes with their ingredient requirements.

**Backend:**
- Define `Recipe` and `RecipeIngredient` SQLModels
- Migration + apply
- CRUD endpoints for recipes (including their ingredient lists)
- Same unit conversion + validation rules as pantry items

**Frontend:**
- Recipe list screen
- Recipe detail screen (read view of name, instructions, notes, ingredients)
- Recipe create/edit form with ingredient picker + quantity + unit inputs

**User-facing criteria:** User can create, view, edit, and delete recipes with full ingredient lists, instructions, and notes.

---

## 8. Feature Slice 4 — Recipe ↔ Pantry Comparison

The core value proposition: "what can I make right now?"

**Backend:**
- Endpoint that returns per-recipe availability: for each ingredient, whether the pantry has enough, partial, or none (using canonical unit comparison)
- Optional aggregate endpoint: "list recipes I can fully make"

**Frontend:**
- Availability indicators on recipe detail (have / partial / missing per ingredient)
- Recipe list shows availability badge at-a-glance
- Optional filter: "show only what I can make"

**User-facing criteria:** User can see, for each recipe, exactly which ingredients they have, are short on, or are missing.

---

## 9. Feature Slice 5 — Cooking Flow

The "use a recipe" action that auto-updates the pantry.

**Backend:**
- `POST /recipes/{id}/cook` endpoint
- Service logic:
  - Subtract each recipe ingredient amount (canonical) from the matching pantry item
  - If pantry quantity is less than required, zero it out (don't go negative)
  - Create a `CookingEvent` row + `CookingEventIngredient` snapshot rows capturing actual amounts subtracted
- Endpoint to list cooking history

**Frontend:**
- "Cook this" button on recipe detail with confirmation
- Cooking history screen (chronological list of past cooks)

**User-facing criteria:** User can mark a recipe as cooked; the pantry updates automatically; user can view a history of cooked recipes.

---

## 10. Feature Slice 6 — Shopping Lists

Persisted shopping lists with check-off support, optionally pre-populated from recipes.

**Backend:**
- Define `ShoppingList` and `ShoppingListItem` SQLModels
- Migration + apply
- CRUD endpoints for shopping lists and items
- Action endpoint: "add missing ingredients from recipe(s) to a shopping list" (computes the missing amounts and inserts them)

**Frontend:**
- Shopping list index (list of existing lists, with current/completed status)
- Shopping list detail with check-off-as-you-shop UX
- From a recipe (or set of recipes): "add missing to shopping list" action

**User-facing criteria:** User can create shopping lists, add missing ingredients from any recipe, and check items off while shopping.

---

## 11. Polish Pass

Tighten up the app before deploying.

- Mobile UX refinement across all screens (touch targets, spacing, readability)
- Empty states (no ingredients yet, no recipes yet, etc.)
- Loading indicators and error handling on API calls
- Form validation feedback
- Anything left over from the feature slices

**User-facing criteria:** App feels polished and works smoothly on iPhone Safari.

---

## 12. Deployment — LXC Setup

Provision the LXC container on Proxmox.

- Create LXC container (Debian or Ubuntu base image)
- Assign a static local IP
- Basic hardening: non-root user with sudo, SSH key auth
- Install runtime dependencies: Python 3.12+, uv, Node.js + npm, git
- Create directory structure:
  ```
  /opt/pantry/         app code (git clone)
  /var/lib/pantry/     SQLite database file
  ```

**User-facing criteria:** N/A — LXC is provisioned and reachable on the LAN.

---

## 13. Deployment — Application

Get the app running as managed services on the LXC.

- Clone the repo to `/opt/pantry`
- Backend: `uv sync`, run `alembic upgrade head`
- Frontend: `npm install`, `npm run build`
- Create systemd services:
  - `pantry-backend.service` runs uvicorn on port 8000
  - `pantry-frontend.service` runs `serve` (or `vite preview`) on port 3000
- Enable both services to start on boot
- Write a `deploy.sh` script that runs on the LXC: pull → install → migrate → build → restart

**User-facing criteria:** App is reachable at `http://<lxc-ip>:3000` from any device on the LAN.

---

## 14. Deployment — Networking

Make the app easy to reach from phones, on the LAN and remotely.

- Verify the LXC is reachable over **Tailscale**
- Add the wife's device to the Tailnet
- Add a **Pi-hole local DNS entry** (e.g. `pantry.home`) pointing to the LXC's static IP
- Test access from iPhone Safari:
  - On home WiFi via `http://pantry.home:3000`
  - Off-network via Tailscale IP

**User-facing criteria:** Both users can open the app on their phones from home and away from home.

---

## 15. Deployment — Backups & Maintenance

Make sure data is safe and updates are easy.

- Configure cron job using SQLite's `.backup` command to snapshot the database nightly
- Verify Proxmox vzdump container backups include `/var/lib/pantry/`
- Decide on retention (how many nightly snapshots to keep)
- Document the deploy/update workflow (run `deploy.sh` after pushing changes)
- Verify logs from both services are accessible via `journalctl`

**User-facing criteria:** N/A — operational readiness.

---

## 16. Future Iterations

Out-of-scope-for-now ideas to revisit after the core app is in use.

- Recipe import from external URLs (AllRecipes, etc. — schema.org Recipe markup)
- Cross-type unit conversion (weight ↔ volume via per-ingredient density)
- Restock-from-shopping-list flow (check off → auto-add to pantry)
- **Caddy** reverse proxy for unified URL + HTTPS
- CI/CD via GitHub Actions (run tests on push)
- Tailscale ACLs to restrict shared-user access to just the pantry app
