# Frontend Design Rules

This document defines mandatory development rules for this project.  
Primary goal: any developer and any AI agent should see technologies, approaches, and constraints immediately, without relying on chat context.

## Technology Stack

- `Eleventy (11ty)` as SSG.
- `Nunjucks` for templates and UI macros.
- `YAML` for content and data.
- `PostCSS` (`postcss-import`, `postcss-media-minmax`, `autoprefixer`, `postcss-csso` in production).
- `esbuild` for JS bundling.
- No Tailwind, no CSS-in-JS.

## Architecture and Sources of Truth

- Source of truth for content: `src/_data/*.yml` and page-level `*.yml`.
- Source of truth for UI components: `src/_includes/*.njk` (`button`, `link`, `icon`, etc.).
- Source of truth for styles: `src/css/blocks/*.css` (one block = one file).
- Do not duplicate logic or SVG markup in local templates if a shared macro/component already exists.

## BEM Naming (Mandatory)

- Block: `.block`
- Element: `.block__element`
- Modifier format: `key_value`  
  `.block_key_value`, `.block__element_key_value`

Examples:

- `button_mode_primary`
- `button_size_l`
- `link_size_xs`
- `site-list__item_current`

Forbidden:

- Legacy modifier format without key: `button_l`, `button_primary`, `link_s`
- Modifiers that duplicate default behavior

## Modifier Rules

- Add a modifier only when it is explicitly passed in macro/markup.
- If parameter is not passed, do not add modifier class.
- Base state must work without `*_mode_base` and `*_size_m`.

## Markup Rules

- Do not add extra wrappers just for styling.
- Do not add extra classes “just in case”.
- If existing block/element already solves it, reuse it.
- Keep list markup as flat and semantic as possible.

## Component Usage Rules

- Render repeated UI via macros (`link`, `button`, `icon`) instead of hand-written markup per template.
- Render icons through `icon.njk`.
- Do not encode content-derived state in classes (example: icon type should come from `icon` argument, not `link_icon_*` classes).

## CSS Approach (Mandatory)

- Foundation: CSS custom properties (tokens + block-level variables).
- Pattern must match `button` / `link` blocks:
  - define block variables at block root (`--button-*`, `--link-*`);
  - in states (`:hover`, `:active`), override variables instead of duplicating full property sets;
  - modifiers should change variables, not rewrite full block styling.

Principles:

- Token layer first (`--color-*`, `--space-*`, `--font-*`, `--shadow-*`), block variables second.
- Prefer variable overrides for states (`*_bg`, `*_color`, `*_shadow`) over separate state-specific property trees.
- Use shared transition tokens for consistent interaction behavior.

## What Is Not Allowed

- No ad-hoc classes for one-off cases when a block already exists.
- No inline-SVG duplication in local templates when icon belongs in `icon` macro.
- No dead modifiers (unused or behavior-neutral).
- No DOM complexity where one element is enough.

## Pre-merge Checklist

- BEM naming follows `key_value` modifiers.
- No extra classes/wrappers.
- No duplicated icon or template logic.
- `button` and `link` macros do not auto-attach default modifiers.
- Build passes: `npm run build`.
