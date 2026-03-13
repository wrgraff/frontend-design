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
Signature: `link(text='Link', href='', mode='', size='', icon='info-signs/link', external=false, target='', rel='', extraClass='')`

Inputs:
- `text` (required, plain string; no markdown/HTML)
- `href` (required for interactive use, string)
- `mode` (optional, string): maps to `link_mode_*`
- `size` (optional, string): maps to `link_size_*` and should use font-token naming (for example: `text-s`, `caption-xs`, `heading-h2`)
- `icon` (optional, string): icon name; empty string disables left icon
- `external` (optional, boolean): shows external icon
- `target` (optional, string)
- `rel` (optional, string)
- `extraClass` (optional, string)

Constraints:
- If `target="_blank"`, pass a safe `rel` value (for example: `noopener noreferrer`).

## button

Source: `src/_includes/button.njk`  
Signature: `button(text='Button', href='', mode='', size='', subtext='', iconLeft='', iconRight='', type='button', extraClass='', download=false)`

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
- `download` (optional, boolean|string): used only for anchor

Constraints:
- If `href` is empty, `type` should be valid button type (`button|submit|reset`).

## iconButton

Source: `src/_includes/icon-button.njk`  
Signature: `iconButton(iconName='api/api_file', href='', mode='', size='', type='button', ariaLabel='Icon button', extraClass='', download=false)`

Inputs:
- `iconName` (optional, string): icon name from `src/_includes/icons`, without `.svg`
- `href` (optional, string): if set, renders `<a>`, otherwise `<button>`
- `mode` (optional, string): supports `secondary` and `primary`; `base` is default state and is rendered without modifier class
- `size` (optional, string): supports `l` and `xl`; `m` is default state and is rendered without modifier class
- `type` (optional, string): used only when rendering `<button>`
- `ariaLabel` (optional, string): accessible name for icon-only control
- `extraClass` (optional, string)
- `download` (optional, boolean|string): used only for anchor

Constraints:
- Icon-only control must have a meaningful `ariaLabel`.

## label

Source: `src/_includes/label.njk`  
Signature: `label(text='Label text', mode='', size='', extraClass='')`

Inputs:
- `text` (required, string)
- `mode` (optional, string): supports `primary` and `special`; `default` is base state and is rendered without modifier class
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

## caseHero

Source: `src/_includes/case-hero.njk`  
Signature: `caseHero(hero = {}, heading = '', description = '', role = '', area = '', tags = [])`

Inputs:
- `hero` (optional, object): visual hero data
- `heading` (optional, plain string): used when `hero.heading` is missing
- `description` (optional, string): used when `hero.lead` is missing
- `role` (optional, markdown string)
- `area` (optional, markdown string)
- `tags` (optional, array of strings)

Inputs (`hero` object):
- `heading` (optional, plain string)
- `lead` (optional, markdown string)
- `image` (optional, string URL/path)
- `image_alt` (optional, string)

Behavior:
- Renders root-level tag labels, a case heading, lead text, detail rows, and an optional media block.

## section

Source: `src/_includes/section.njk`  
Signature: `section(data = {})` (+ supports `{% call section(...) %}...{% endcall %}`)

Inputs (`data` object):
- `id` (optional, string)
- `extra_class` (optional, string)
- `pretitle` (optional, plain string)
- `heading` (optional, plain string)
- `lead` (optional, markdown string)
- `content` (optional, markdown string)
- `conclusion` (optional, markdown string)
- `cta` (optional, array of CTA items)

CTA item:
- `kind` (optional, string): `link` uses `link` macro; anything else uses `button` macro
- `text` (required, plain string)
- `href` (optional; required for link CTA)
- `mode` (optional)
- `size` (optional)
- `icon` (optional, link CTA)
- `external` (optional, link CTA)
- `target` (optional, link CTA)
- `rel` (optional, link CTA)
- `icon_left` (optional, button CTA)
- `icon_right` (optional, button CTA)
- `subtext` (optional, plain string; button CTA)
- `type` (optional, button CTA)
- `extra_class` (optional)
- `download` (optional, button CTA)

Behavior:
- If used with `{% call %}`, caller HTML is appended into `.section__content`.
- `data.content` and caller content can be used together.
- `data.conclusion`, if present, is rendered after `.section__content` in `.section__tail`.

Constraints:
- Use either markdown content (`data.content`) or caller HTML for structured blocks; avoid mixing when not needed.
- For `kind: link`, provide `href`.

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
