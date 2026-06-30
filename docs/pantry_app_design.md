# Pantry App — Design Decisions

## 1. Project Overview

A personal pantry management web application that bridges ingredient inventory tracking with recipe management. The core loop is: stock pantry → browse recipes → cook → auto-update inventory → generate shopping list.

---

## 2. Scope & Goals

### In Scope
- Pantry inventory management (add, edit, remove items with quantity and unit)
- Recipe storage with ingredient lists
- Ingredient availability check per recipe (have / partial / missing)
- Cook a recipe — automatically subtract ingredients from pantry
- Shopping list generation from one or more recipes (shopping lists are persisted)
- Manual pantry restock
- Cooking history (track what was cooked and when)
- Unit conversion within the same measurement type (weight↔weight, volume↔volume)

### Out of Scope (for now)
- Recipe import from external URLs *(nice-to-have, future feature)*
- Cross-type unit conversion (e.g. cups ↔ grams, which would require ingredient density)
- Native iOS app

---

## 3. Users & Access

- **Primary user:** personal use (single owner/household)
- **Secondary user:** wife may be added for shared household access
- No public user base or multi-tenant requirements

---

## 4. Platform & Access

- Delivered as a **responsive web app** (not a native iOS app)
- Accessed via Safari on iPhone
- Must be mobile-friendly (touch targets, readable text, responsive layout)

---

## 5. Hosting & Infrastructure

### Server
- Self-hosted on existing **Proxmox hypervisor** (home server)
- Deployed inside an **LXC container** (preferred over a full VM — lighter weight, sufficient for this use case)
- LXC container assigned a **static local IP**

### Network Access
- **Local:** iPhone connects via home WiFi to the LXC container's static IP
- **Remote:** Tailscale VPN already set up — provides secure tunnel to home network from anywhere
- **Wife's access:** she can be added to the Tailnet to access the app remotely
- **Tailscale preferred over ngrok** — ngrok is designed for temporary tunnels; free tier changes URL on restart; not suitable for a persistent personal app
- **Optional:** local DNS entry for a friendly URL (e.g. `pantry.home`) instead of a raw IP
  > **Note:** Pi-hole (already running on Proxmox) can serve this role — add a record under *Local DNS → DNS Records* in the Pi-hole admin UI. Prefer `.home` or `.lan` over `.local` (`.local` is reserved for mDNS and can cause conflicts on Apple devices). Note this friendly URL only resolves on home WiFi, not over Tailscale, without additional DNS configuration.

---

## 6. Tech Stack

### Frontend
| Concern | Choice | Notes |
|---|---|---|
| Framework | **React** | Responsive, works well in iPhone Safari |
| Styling | Tailwind CSS or shadcn/ui | Mobile-friendly components |
| Unit conversion | **convert** | Tree-shakeable TypeScript unit-conversion library; conversion runs client-side |

### Backend
| Concern | Choice | Notes |
|---|---|---|
| Language | **Python** | |
| Web framework | **FastAPI** | Modern, async, auto-generates OpenAPI/Swagger docs |
| ASGI server | **Uvicorn** | Standard FastAPI runtime |
| Validation/serialization | **Pydantic** | Built into FastAPI |
| ORM + models | **SQLModel** | Unifies Pydantic and SQLAlchemy — define each entity once for both API and DB |
| Migrations | **Alembic** | Standard for SQLAlchemy/SQLModel schemas |
| Dependency management | **uv** | Modern, fast Python package manager |
| Testing | **pytest** | |

### Database
| Concern | Choice | Notes |
|---|---|---|
| DB | **SQLite** | File-based, zero infrastructure, sufficient for personal use; upgrade path to PostgreSQL available later |

### Type Sharing (Optional)
Consider using `openapi-typescript` to generate TypeScript interfaces on the frontend from FastAPI's OpenAPI spec, avoiding duplicated type definitions across the stack.

---

## 7. Data Model

### Design Principles
- **Ingredients are first-class entities** — referenced by ID from pantry, recipes, shopping lists, and cooking history. Ensures consistent identification across the system.
- **Canonical units internally** — all quantities are stored in a canonical unit per measurement type (grams for weight, milliliters for volume, whole numbers for count). This makes comparison logic a simple numeric operation.
- **Display unit preserved per row** — alongside the canonical quantity, each row stores the unit the user originally entered, so the UI can render values in the units the user expects (e.g. "2 cups" rather than "473 ml").
- **Conversion via library, client-side** — use the `convert` TypeScript library rather than maintaining a units table. Conversion happens on the frontend: the client converts the user-entered value to canonical units before sending it to the API, and converts canonical values back to the display unit for rendering. The backend stores and compares canonical numbers only and performs no conversion.
- **Conversion within type only** — weight↔weight and volume↔volume; no cross-type conversion. Each ingredient has a fixed `measurement_type` to prevent mismatched units in the first place.
- **Shopping lists and recipes are decoupled** — recipes can inform what gets added to a shopping list, but no persistent link is stored between them.
- **Cooking history snapshots quantities used** — so edits to recipes don't retroactively change historical records, and undo of a cook event is accurate.

### Entities

**Ingredient** — the reference catalog of ingredient types.
```
id
name (unique)
measurement_type ("weight" | "volume" | "count")
default_unit (string, e.g. "g", "ml", "each")
department ("produce" | "meat" | "dairy/eggs" | "bakery" | "frozen" | "canned" | "baking" | "snacks" | "beverages" | "other")
```

**PantryItem** — current stock of a specific ingredient.
```
id
ingredient_id → Ingredient
quantity_canonical
display_unit (string)
```

**Recipe** — a saved dish.
```
id
name
instructions (markdown)
notes (freeform text — servings, prep time, etc.)
created_at
```

**RecipeIngredient** — join between Recipe and Ingredient with required quantity.
```
id
recipe_id → Recipe
ingredient_id → Ingredient
quantity_canonical
display_unit (string)
```

**ShoppingList** — a persisted list of items to buy.
```
id
name
created_at
completed_at (nullable)
```

**ShoppingListItem** — an entry on a shopping list.
```
id
shopping_list_id → ShoppingList
ingredient_id → Ingredient
quantity_canonical
display_unit (string)
is_purchased (boolean)
```

**CookingEvent** — a record that a recipe was cooked.
```
id
recipe_id → Recipe
cooked_at (timestamp)
```

**CookingEventIngredient** — snapshot of the exact quantities subtracted from the pantry during a cook event.
```
id
cooking_event_id → CookingEvent
ingredient_id → Ingredient
quantity_canonical
display_unit (string)
```

### Notes on Behavior
- When a recipe ingredient is entered, the unit must be compatible with the ingredient's `measurement_type`. The UI should constrain unit choices accordingly.
- When cooking a recipe, the pantry quantity is decremented by the recipe's canonical amount. If the pantry has less than required, the quantity is zeroed rather than going negative.
- When adding recipe ingredients to a shopping list, the missing amount is calculated as `required - available` in canonical units, then displayed in the user's preferred unit.

---

## 8. Future Considerations

- Recipe import from external sources (e.g. AllRecipes uses schema.org Recipe markup — scrapeable)
- Cross-type unit conversion (weight↔volume) via per-ingredient density
- Restock from shopping list flow (check off items → auto-add to pantry)
- Tailscale ACLs to restrict wife's access to only the pantry app port/device
