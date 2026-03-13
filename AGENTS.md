# Agent Rules

This file is the source of truth for implementation rules that AI agents must follow in this repository.

## Technology Stack

- `Eleventy (11ty)` as SSG.
- `Nunjucks` for templates and UI macros.
- `YAML` for content and data.
- `PostCSS` (`postcss-import`, `postcss-media-minmax`, `autoprefixer`, `postcss-csso` in production).
- `esbuild` for JS bundling.
- No Tailwind, no CSS-in-JS.

## Architecture and Sources of Truth

- Source of truth for content: `src/_data/*.yml` and page-level `*.yml`.
- Source of truth for i18n strategy/locales: `src/_data/i18n.yml`.
- Source of truth for UI components: `src/_includes/*.njk` (`button`, `link`, `icon`, etc.).
- Source of truth for macro API contracts: `docs/components.md`.
- Source of truth for styles: `src/css/blocks/*.css` (one block = one file).
- Do not duplicate logic or SVG markup in local templates if a shared macro/component already exists.

## Language Policy

- Primary site language is `EN`.
- Planned additional locales are `DE` and `SK`.
- Do not introduce `RU` content/UI copy unless explicitly requested for a specific task.
- The language of user prompts does not change site content language requirements.

## BEM Naming (Mandatory)

- Block: `.block`
- Element: `.block__element`
- Modifier format: `key_value`  
  `.block_key_value`, `.block__element_key_value`
- Class order in markup: `block__element block` (element first, then block)

Examples:

- `button_mode_primary`
- `button_size_l`
- `link_size_xs`
- `site-list__item_current`
- `section__header section-header`

Forbidden:

- Legacy modifier format without key: `button_l`, `button_primary`, `link_s`
- Modifiers that duplicate default behavior

## Modifier Rules

- Add a modifier only when it is explicitly passed in macro/markup.
- If parameter is not passed, do not add modifier class.
- Base state must work without `*_mode_base` and `*_size_m`.

## Block vs Modifier (Recommendation)

- Avoid growing generic blocks (especially `section`) with multiple feature-specific elements like `section__foo-*`, `section__bar-*`, `section__baz-*`.
- If a section variation needs more than 1-2 unique elements, create a standalone block and place it inside `section` content.
- Nested specificity patterns like `block__element-specific-morespecific` are a signal to extract a new block.
- Keep `section` as a base layout shell. Strongly unique entities (for example hero-like or contacts-map-like compositions) should be separate blocks.
- If there is doubt between extending an existing block with a modifier vs creating a new block, stop and ask the user directly before implementation.

## Markup Rules

- Do not add extra wrappers just for styling.
- Do not add extra classes “just in case”.
- If existing block/element already solves it, reuse it.
- Keep list markup as flat and semantic as possible.
- Internal links in templates/macros must go through locale-aware routing (`localePath` filter). Do not hardcode locale prefixes.
- Prefer simple and clean naming over over-specific/double naming. If both are valid, choose the simpler name.
- Prefer composition via mixed BEM blocks over deep element trees. Avoid structures like `block__meta-item`, `block__meta-term`, `block__meta-value`; split these into small mixed blocks when possible.
- Prefer `heading` naming over `title` naming for markup/data fields in page sections and case cards.
- Raster images must be wrapped in `<picture>` (required baseline for future responsive/image optimization pipeline).

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
- Border widths must follow the design spec (`light`, `medium`, `bold`, etc.). Do not use `hair` unless the design explicitly calls for a hairline.
- If design explicitly calls for `hair`: keep default non-retina width at `light`, and switch to `--space-border-hair` only inside a retina/HiDPI media query such as `(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)`.

Principles:

- Token layer first (`--color-*`, `--space-*`, `--font-*`, `--shadow-*`), block variables second.
- Prefer variable overrides for states (`*_bg`, `*_color`, `*_shadow`) over separate state-specific property trees.
- Use shared transition tokens for consistent interaction behavior.
- Keep CSS specificity as low as possible.
- Avoid selector chains and combinators (`.block .block__el`, `.block > .block__el`) when a plain BEM selector is enough (`.block__el`).
- Do not increase specificity “for safety”; solve collisions via block structure, source order, and variables.

Soft convention (non-strict, do not lint):

- In block CSS files, split block root into two separate sections.
- First declaration of `.block` should contain variables only.
- Second declaration of `.block` should contain style declarations only.

## BEM Layout Boundaries (Mandatory)

- In `src/css/blocks/<block>.css`, selectors must target only that block: `.block`, `.block__element`, `.block_modifier_value`, `.block__element_modifier_value`.
- Cross-block and contextual selectors are forbidden in block files (examples: `.section .block`, `.other-block__el`, tag styling through parent blocks).
- BEM block selector (`.block`) must not set `margin`.
- BEM block selector (`.block`) may set only `z-index: 0` (for local stacking scope). Any other `z-index` value on block root is forbidden.
- BEM block selector (`.block`) must not set `position: absolute`.
- Block root may define its own internal layout (`display`, `grid-template-*`, `flex-*` for internal children).
- Block root must not position itself in parent layout: forbid parent-placement properties on `.block` (`grid-column`, `grid-row`, `grid-area`, `align-self`, `justify-self`, `place-self`, `order`).
- If `z-index` is used inside a block, that block (or a parent element within the same block scope) must define a local stacking context with `z-index: 0`.
- `position: absolute` is allowed only on elements (`.block__element`), and must be anchored by `position: relative|sticky|fixed` on the block root or another parent element inside the same block.
- If an element is used as both an element and a standalone block (`class="a__b b"`), do not set `padding` on the element selector (`.a__b`); set it on `.b`.

## What Is Not Allowed

- No ad-hoc classes for one-off cases when a block already exists.
- No inline-SVG duplication in local templates when icon belongs in `icon` macro.
- No dead modifiers (unused or behavior-neutral).
- No DOM complexity where one element is enough.

## Pre-merge Checklist

- BEM naming follows `key_value` modifiers.
- No extra classes/wrappers.
- No duplicated icon or template logic.
- `docs/components.md` is updated when macro input/output contract changes.
- `button` and `link` macros do not auto-attach default modifiers.
- Strict lint suite passes: `npm run lint:all:strict`.
