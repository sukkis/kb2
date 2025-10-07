# kb2

Add and search code snippets. Backend: Deno, Oak, Deno KV. Frontend: Svelte,
Vite, TypeScript.

## API

- REST endpoints for snippets: add, get, delete, list, search.
- Health check: `/health`
- Docs: `/docs` (Swagger UI), spec at `/docs/openapi.yaml`

## Usage

- Backend: `./run.sh backend`
- Frontend: `./run.sh frontend`
- Fullstack (backend+frontend): `./run.sh fullstack`
- Tests: `./run.sh test`

## Notes

- Snippets stored in Deno KV.
- Static files and Swagger UI in `backend/swagger-ui/`.
- Frontend talks to backend at `localhost:8087`.
- See `src/routes/` for API logic.
