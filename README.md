# ArturTrifonov.com

Eleventy-based personal site with Nunjucks templates, YAML content, and token-driven CSS blocks.

## Rules

Implementation and styling rules are split out to:

- [`AGENTS.md`](/home/arturtrifonov/srv/frontend-design/AGENTS.md)

`AGENTS.md` is the source of truth for agent-facing and engineering constraints (BEM, CSS variable layer, layout boundaries, etc.).

Macro contracts are documented in:

- [`docs/components.md`](/home/arturtrifonov/srv/frontend-design/docs/components.md)

## Stack

- `Eleventy (11ty)`
- `Nunjucks`
- `YAML`
- `PostCSS`
- `esbuild`

## Scripts

- `npm run start` — local dev server
- `npm run build` — production build
- `npm run lint:css` — stylelint check
- `npm run lint:data` — YAML content contracts validation
- `npm run lint:all:strict` — mandatory full lint suite (`css` + `data` + strict contracts)
- `npm run fix:css` — stylelint autofix

## Project Structure

- `src/pages` — pages
- `src/_includes` — reusable template macros/components
- `src/_layouts` — base layouts
- `src/_data` — shared data
- `src/css` — tokens, utilities, and block styles
- `docs/components.md` — macro API contracts
