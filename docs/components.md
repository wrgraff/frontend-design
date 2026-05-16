# Components Contracts

This document defines API contracts for reusable Nunjucks macros in `src/_includes`.

## icon

Source: `src/_includes/icon.njk`  
Signature: `icon(name, className = '', size = 32)`

Inputs:
- `name` (required, string): icon path in `src/_includes/icons`, without `.svg` (example: `maps-navigation/start_journey`)
- `className` (optional, string): additional classes
- `size` (optional, number|string): width/height for rendered SVG

Behavior:
- If icon file is missing, macro renders nothing.

## link

Source: `src/_includes/link.njk`  
Signature: `link(text='Link', href='', mode='', size='', iconName='info-signs/link', external=false, extraClass='')`

Inputs:
- `text` (required, plain string; no markdown/HTML)
- `href` (required for interactive use, string)
- `mode` (optional, string): maps to `link_mode_*`
- `size` (optional, string): maps to `link_size_*` and should use font-token naming (for example: `text-s`, `caption-xs`, `heading-h2`)
- `iconName` (optional, string): icon name; empty string disables left icon
- `external` (optional, boolean): shows external icon and defaults link to external-safe behavior (`target="_blank"` + safe `rel`)
- `extraClass` (optional, string)

Constraints:
- If `external=true`, macro always sets `target="_blank"` and `rel="noopener noreferrer"`.

## button

Source: `src/_includes/button.njk`  
Signature: `button(text='Button', href='', mode='', size='', subtext='', iconLeft='', iconRight='', type='button', extraClass='', dataAttrs='', download=false)`

Inputs:
- `text` (required, plain string; no markdown/HTML)
- `href` (optional, string): if set, renders `<a>`, otherwise `<button>`
- `mode` (optional, string): maps to `button_mode_*`
- `size` (optional, string): maps to `button_size_*`
- `subtext` (optional, plain string; no markdown/HTML)
- `iconLeft` (optional, string)
- `iconRight` (optional, string)
- `type` (optional, string): used only when rendering `<button>`
- `extraClass` (optional, string)
- `dataAttrs` (optional, string): raw attribute string for custom data hooks (for example `data-video-modal-trigger`)
- `download` (optional, boolean|string): used only for anchor

Constraints:
- If `href` is empty, `type` should be valid button type (`button|submit|reset`).

## ctaItem

Source: `src/_includes/cta-item.njk`  
Signature: `ctaItem(item = {}, defaultMode = 'secondary', defaultSize = 'l', defaultType = 'button')`

Inputs:
- `item` (optional, object): CTA item data
  - `kind` (optional, string): `link` uses `link` macro; anything else uses `button` macro
  - `text` (required, plain string)
  - `href` (optional)
  - `mode` (optional)
  - `size` (optional)
  - `extra_class` (optional)
  - link-specific: `icon_name` (preferred), `icon` (legacy alias), `external`
  - button-specific: `subtext`, `icon_left`, `icon_right`, `type`, `data_attrs`, `download`
- `defaultMode` (optional, string): fallback mode for button path
- `defaultSize` (optional, string): fallback size for button path
- `defaultType` (optional, string): fallback type for button path

Behavior:
- Shared CTA renderer used by `hero` and `section`.

## iconButton

Source: `src/_includes/icon-button.njk`  
Signature: `iconButton(iconName='api/api_file', href='', mode='', size='', type='button', ariaLabel='Icon button', extraClass='', dataAttrs='', download=false)`

Inputs:
- `iconName` (optional, string): icon name from `src/_includes/icons`, without `.svg`
- `href` (optional, string): if set, renders `<a>`, otherwise `<button>`
- `mode` (optional, string): supports `secondary` and `primary`; `base` is default state and is rendered without modifier class
- `size` (optional, string): supports `l` and `xl`; `m` is default state and is rendered without modifier class
- `type` (optional, string): used only when rendering `<button>`
- `ariaLabel` (optional, string): accessible name for icon-only control
- `extraClass` (optional, string)
- `dataAttrs` (optional, string): raw attribute string for custom data hooks (for example `data-slider-control-prev`)
- `download` (optional, boolean|string): used only for anchor

Constraints:
- Icon-only control must have a meaningful `ariaLabel`.

## iconLink

Source: `src/_includes/icon-link.njk`  
Signature: `iconLink(iconName='info-signs/link', href='', size='', ariaLabel='Icon link', external=false, extraClass='')`

Inputs:
- `iconName` (optional, string): icon name from `src/_includes/icons`, without `.svg`
- `href` (required for interactive use, string)
- `size` (optional, string): supports `s` and `m`; `xs` is base state and is rendered without modifier class
- `ariaLabel` (optional, string): accessible name for icon-only link
- `external` (optional, boolean): adds `target="_blank"` + `rel="noopener noreferrer"`
- `extraClass` (optional, string)

Constraints:
- Icon-only control must have a meaningful `ariaLabel`.

## label

Source: `src/_includes/label.njk`  
Signature: `label(text='Label text', mode='', tone='', size='', extraClass='')`

Inputs:
- `text` (required, string)
- `mode` (optional, string): supports `primary` and `special`; `default` is base state and is rendered without modifier class
- `tone` (optional, string): color tone modifier via `label_tone_*`; for `mode=special` supported tones are
  `success`, `warning`, `error`, `orange`, `amber`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `violet`, `purple`, `fuchsia`, `pink`, `rose` (15 total)
- `size` (optional, string): supports `m`; `l` is base state and is rendered without modifier class
- `extraClass` (optional, string)

Constraints:
- Macro returns non-interactive `<span>` and must not be used as link/button replacement.

## heroSection

Source: `src/_includes/hero.njk`  
Signature: `heroSection(hero)`

Inputs (`hero` object):
- `heading` (required, plain string)
- `heading_highlight` (optional, plain string): accent fragment appended after `heading`
- `heading_suffix` (optional, plain string): trailing fragment appended after `heading_highlight`
- `text` (optional, markdown string)
- `image` (optional, string URL/path)
- `image_alt` (optional, string)
- `cta` (optional, array of CTA items)

CTA item:
- `text` (required, plain string)
- `href` (optional)
- `mode` (optional)
- `size` (optional)
- `subtext` (optional, plain string)
- `icon_left` (optional)
- `icon_right` (optional)
- `type` (optional, defaults to `button`)
- `extra_class` (optional)
- `download` (optional, boolean|string)

Constraints:
- `heading` is rendered as `<h1>`.

Behavior:
- If `hero.image` is empty/missing, root section gets modifier class `hero_size_small`.

## articleHeader

Source: `src/_includes/article-header.njk`  
Signature: `articleHeader(heading = '', description = '', tags = [])`

Inputs:
- `heading` (optional, plain string): article heading rendered as `<h1>`
- `description` (optional, plain string): article lead text
- `tags` (optional, array of strings): rendered via `label` macro with `#` prefix

Behavior:
- Renders standalone `article-header` block intended for publication/article pages.
- Uses `label` macro for tag chips.

## caseHero

Source: `src/_includes/case-hero.njk`  
Signature: `caseHero(hero = {}, heading = '', description = '', role = '', area = '', tags = [], baseUrl = '')`

Inputs:
- `hero` (optional, object): visual hero data
- `heading` (optional, plain string): used when `hero.heading` is missing
- `description` (optional, string): used when `hero.lead` is missing
- `role` (optional, markdown string)
- `area` (optional, markdown string)
- `tags` (optional, array of strings)
- `baseUrl` (optional, string): page URL used to resolve short image filenames

Inputs (`hero` object):
- `heading` (optional, plain string)
- `lead` (optional, markdown string)
- `image` (optional, string URL/path): short filenames are resolved as `img/<filename>` relative to the case page
- `image_alt` (optional, string)
- `picture_tone` (optional, string): `primary`, `alt`, `bg-secondary`; if missing, gradient background is used

Behavior:
- Renders root-level tag labels, a case heading, lead text, detail rows, and an optional media block.

## caseContacts

Source: `src/_includes/case-contacts.njk`  
Signature: `caseContacts(data = {}, contactsData = {}, baseUrl = '', theme = '')`

Fields:

- `data.heading` (optional, string): final section heading.
- `data.lead` (optional, markdown string): final section lead text.
- `data.image` (optional, object): decorative image with `src`, `alt`, `width`, and `height`; short filenames resolve as `img/<filename>` relative to the case page.
- `contactsData.items` (object): shared contact item source, usually `global.contacts.items`.

Behavior:

- Renders a standalone final case contact section, outside the regular `sections` content flow.
- Contact labels, URLs, icons, order, and external state come from shared contact data and the shared links block; case YAML owns only section-specific copy.
- Contact groups are rendered through the shared `contactsLinks` macro.

## contactsLinks

Source: `src/_includes/contacts-links.njk`  
Signature: `contactsLinks(contactsData = {}, extraClass = '')`

Fields:

- `contactsData.items` (object): shared contact item source, usually `global.contacts.items`.
- `extraClass` (optional, string): additional class for block mix usage.

Behavior:

- Renders a standalone `contacts-links` block.
- Keeps the same internal columns, link size, and icon treatment wherever it is mixed.
- Uses the original contacts-section grouping: `linkedin`, `behance`, `dribbble` in the first column; `email`, `whatsapp`, `telegram` in the second group spanning the second and third columns.
- Contact labels, URLs, icons, and external state come from shared contact data.
- Each contact link is rendered through the shared `link` macro.

## section

Source: `src/_includes/section.njk`  
Signature: `section(data = {})` (+ supports `{% call section(...) %}...{% endcall %}`)

Inputs (`data` object):
- `id` (optional, string)
- `extra_class` (optional, string)
- `pretitle` (optional, plain string)
- `heading` (optional, plain string)
- `lead` (optional, markdown string)
- `content` (optional, markdown string): plain section markdown body
- `content_columns` (optional, number): container width in grid columns (`2`, `3`, `4`, `5`), maps to `section__container_width_*`
- `tail` (optional, markdown string): preferred section tail field
- `conclusion` (optional, markdown string): legacy alias for `tail`
- `cta` (optional, array of CTA items): rendered via `ctaItem`
- `decor` (optional, array): decorative media list rendered at the end of the section
  - item fields: `type` (optional, string), `image` (required, string URL/path), `width` (required, number|string), `height` (required, number|string)

Behavior:
- If used with `{% call %}`, caller HTML is rendered inside `.section__container`.
- `data.content` and caller content can be used together.
- `tail`/`conclusion`, if present, is rendered after content container(s) in `.section__tail`.
- `cta`, if present, is rendered in `.section__cta` via shared `ctaItem`.
- Each decor item is rendered as `<picture class="section__decor ...">` with nested `<img class="section__decor-image">` after content/tail.
- If `decor[i].type` is provided, `section` adds modifier class `section__decor_type_<type>` automatically.
- Decor visibility is type-driven; items without dedicated `section__decor_type_*` styles remain hidden by default.
- Decor `<img>` is rendered with `aria-hidden="true"` and fixed `alt=""`.

Constraints:
- Use either markdown content (`data.content`) or caller HTML for structured blocks; avoid mixing when not needed.
- If `content_columns` is omitted, container width defaults to `4` columns.

## contentList

Source: `src/_includes/content-list.njk`  
Signature: `contentList(data = {})`

Inputs (`data` object):
- `heading` (optional, plain string): heading for the block
- `ordered` (optional, boolean): `true` renders `<ol>`, otherwise `<ul>`
- `columns` (optional, number): supported values `2`, `3` (maps to `list_columns_*`)
- `items` (optional, array): each item can be either a markdown string or an object
  - object fields: `text` (markdown string), `label` (optional string for ordered labels via `data-list-label`)

Behavior:
- Renders standalone `content-list` block intended to be mixed into `section__container`.

## contentColumns

Source: `src/_includes/content-columns.njk`  
Signature: `contentColumns(data = {})`

Inputs (`data` object):
- `heading` (optional, plain string): heading for the block
- `columns` (optional, number): supported values `2`, `3` (maps to `content-columns_columns_*`)
- `items` (optional, array of markdown strings): each item is rendered as one column

Behavior:
- Renders standalone `content-columns` block intended to be mixed into `section__container`.

## contentText

Source: `src/_includes/content-text.njk`  
Signature: `contentText(data = {})`

Inputs (`data` object):
- `heading` (optional, plain string): text block heading
- `content` (optional, markdown string): plain text/rich text body

Behavior:
- Renders standalone `content-text` block intended to be mixed into `section__container`.
- Width is controlled on `section__container` level, not inside `content-text`.

## contentTable

Source: `src/_includes/content-table.njk`  
Signature: `contentTable(data = {})`

Inputs (`data` object):
- `heading` (optional, plain string): heading for the block
- `size` (optional, string): `m` or `s` (forwarded to `table`)
- `columns` (optional, array): table columns definition
  - column fields: `key` (required), `heading` (optional)
- `rows` (optional, array of objects): each row object maps values by column `key`
  - plain cell value: markdown string
  - object cell value: `text` (plain string), `tone` (optional: `success|warning|error`), `icon` (optional icon name for `icon` macro)

Behavior:
- Renders standalone `content-table` wrapper block intended to be mixed into `section__container`.
- Internally delegates table markup to `table`.
- Footer/summary actions are intentionally out of scope for this macro.
- Does not add horizontal scroll wrapper.

## datatable

Source: `src/_includes/datatable.njk`  
Signature: `datatable(data = {})`

Inputs (`data` object):
- `heading` (optional, plain string): heading for the block
- `size` (optional, string): `m` or `s` (forwarded to `table`)
- `columns` (optional, array): table columns definition
  - column fields: `key` (required), `heading` (optional)
- `rows` (optional, array of objects): each row object maps values by column `key`
  - plain cell value: markdown string
  - object cell value: `text` (plain string), `tone` (optional: `success|warning|error`), `icon` (optional icon name for `icon` macro)

Behavior:
- Renders standalone `datatable` wrapper block intended to be mixed into `section__container`.
- Internally delegates table markup to `table`.
- Adds horizontal scroll wrapper around the table (`.datatable__scroll`).

## picture

Source: `src/_includes/picture.njk`  
Signature: `picture(image = {}, description = '', extraClass = '')`

Inputs:
- `image` (required for output, object): image descriptor
  - fields: `src` (required), `alt` (optional), `width` (required), `height` (required), `description` (optional, plain string), `caption` (optional, plain string)
- `description` (optional, plain string): explicit caption override; falls back to `image.description`, then `image.caption`, then `image.alt`
- `extraClass` (optional, string): additional class for block mix usage

Behavior:
- Renders standalone `picture` block with image and optional `figcaption`.
- If required image fields are missing, renders nothing.

## slider

Source: `src/_includes/slider.njk`  
Signature: `slider(images = [], ariaLabel = 'Image slider', previousLabel = 'Previous slide', nextLabel = 'Next slide', extraClass = '')`

Inputs:
- `images` (required for output, array): slide media list
  - shared fields: `type` (optional, string), `src` (required), `description` (optional, plain string), `caption` (optional, plain string)
  - image fields (`type` omitted or not `iframe`): `alt` (optional), `width` (required), `height` (required)
  - iframe fields (`type='iframe'`): `title` (optional), `height` (optional)
- `ariaLabel` (optional, plain string): label for keyboard-focusable slider region
- `previousLabel` (optional, plain string): aria-label for previous control button
- `nextLabel` (optional, plain string): aria-label for next control button
- `extraClass` (optional, string): additional class for block mix usage

Behavior:
- Renders standalone `slider` block with slides, controls, counter, and current slide description.
- For image slides, the media container aspect ratio is derived from the first slide `width/height`.
- Slide description text falls back from `description` to `caption`, then `alt`.
- Supports image slides and embedded iframe slides (`type='iframe'`) within the same slider API.
- JS module `design-solution-slider` initializes behavior for `.slider[data-slider]`: updates active slide state, updates counter/description, exposes polite live status text, disables controls on first/last slide, and handles keyboard navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
- If less than two slides are provided, the control footer is not rendered.

## designSolution

Source: `src/_includes/design-solution.njk`  
Signature: `designSolution(data = {}, baseUrl = '')`

Inputs (`data` object):
- `images` (optional, array): media slides
  - image fields: `src` (required), `alt` (optional), `width` (required), `height` (required), `description` (optional, plain string), `caption` (optional, plain string)
- `prototype` (optional, object): embedded prototype media
  - fields: `src` (required), `title` (optional), `height` (optional), `description` (optional, plain string)
- `primary` (optional, array): first row of details
  - detail fields: `heading` (optional, plain string), `content` (optional, markdown string)
- `secondary` (optional, array): second row of details
  - detail fields: `heading` (optional, plain string), `items` (optional, array of markdown strings), `content` (optional, markdown string)
- `baseUrl` (optional, string): page URL used to resolve short image filenames in `images[].src`

Behavior:
- Renders standalone `design-solution` block intended to be mixed into `section__container`.
- If `images.length > 1`, composes the standalone `slider` macro/block.
- If exactly one image is passed, composes the standalone `picture` macro/block (without slider controls).
- If `images` are not provided and `prototype.src` is set, composes the standalone `slider` macro/block with a single iframe slide (without slider controls).
- Primary and secondary details render through the standalone `design-solution-list` block; the first two primary items render shared icons before their headings.
- For `prototype`, macro normalizes `figma.com/proto` URLs to `embed.figma.com/proto` and appends fixed params on render:
  `scaling=contain&content-scaling=responsive&hide-ui=1&embed-host=arturtrifonov.com`.
- If the source URL already contains Figma share params (`t`, `scaling`, `content-scaling`, `hide-ui`, `embed-host`), macro strips them before appending the fixed params.
- `page-id` is preserved from the source URL when present; if absent, it is not added automatically.

## table

Source: `src/_includes/table.njk`  
Signature: `table(data = {})`

Inputs (`data` object):
- `size` (optional, string): `m` (default) or `s`
- `layout` (optional, string): `blocks` stacks cells inside each row on narrow screens
- `columns` (optional, array): table columns definition
  - column fields: `key` (required), `heading` (optional)
  - optional colgroup fields: `width`, `min_width`, `max_width` (CSS values), `extra_class` (optional string class for `<col>`)
- `rows` (optional, array of objects): each row object maps values by column `key`
  - plain cell value: markdown string
  - object cell value: `text` (plain string), `tone` (optional: `success|warning|error`), `icon` (optional icon name for `icon` macro)

Behavior:
- Renders a reusable base table component (`table`) used by content blocks.
- Renders optional `<colgroup>` when columns are passed, forwarding column layout parameters to `<col>`.

## timelineSection

Source: `src/_includes/timeline-section.njk`  
Signature: `timelineSection(data = {})`

Inputs (`data` object):
- `id` (optional, string)
- `extra_class` (optional, string)
- `pretitle` (optional, plain string)
- `heading` (optional, plain string)
- `lead` (optional, markdown string)
- `details` (optional, array of markdown strings)
- `content` (optional, markdown string)
- `conclusion` (optional, markdown string)
- `timeline` (optional, object)

Inputs (`timeline` object):
- `date` (optional, string)
- `company` (optional, string)
- `role` (optional, string)
- `description` (optional, string)
- `order` (optional, string): `last` adds `timeline_order_last` modifier
