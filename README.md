# kb2

Tool for adding and searching for snippets, written in TypeScript.

Uses Deno KV for persistence.

## API Docs

Interactive API documentation is available at `/docs` (Swagger UI). OpenAPI spec
at `/docs/openapi.yaml`.

## Usage

- Start server: `deno task dev`
- Run tests: `deno task test`

## Notes

- Static files for Swagger UI are in `swagger-ui/` (excluded from lint and fmt)
- API endpoints and routers in `src/routes/`
- Config in `deno.json`
