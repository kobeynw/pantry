# Pantry

Web application to help users manage personal food inventory, recipes, and grocery lists.

## Tech Stack

### Frontend
| Concern | Choice | Notes |
|---|---|---|
| Framework | **React** | Responsive, works well for mobile |
| Styling | **Tailwind CSS** | Mobile-friendly components |
| Unit conversion | **convert** | Tree-shakeable TypeScript unit-conversion library; conversion runs client-side |

### Backend
| Concern | Choice | Notes |
|---|---|---|
| Language | **Python** | |
| Web framework | **FastAPI** | Modern, async, auto-generates OpenAPI/Swagger docs |
| ASGI server | **Uvicorn** | Standard FastAPI runtime |
| ORM + models | **SQLModel** | Unifies Pydantic and SQLAlchemy — define each entity once for both API and DB |
| Migrations | **Alembic** | Standard for SQLAlchemy/SQLModel schemas |
| Dependency management | **uv** | Modern, fast Python package manager |
| Testing | **pytest** | |

### Database
| Concern | Choice | Notes |
|---|---|---|
| DB | **SQLite** | File-based, zero infrastructure, sufficient for small-scale app |