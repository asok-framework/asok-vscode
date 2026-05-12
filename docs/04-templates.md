# Templates

Asok features a powerful, built-in template engine with an elegant, intuitive syntax. Designed for performance and security, it requires no external dependencies.

## Variables

```html
{{ name }}
{{ user.email }}
{{ request.path }}
```

Works with both objects and dicts — `user.email` resolves `user.email` (attribute) or `user['email']` (dict key).

## Auto-escape

All `{{ expressions }}` are HTML-escaped automatically. To opt out (for trusted HTML), use the `safe` filter or wrap the value in `SafeString` from Python:

```html
{{ user_input }}              → "&lt;script&gt;..."
{{ trusted_html | safe }}     → "<strong>...</strong>"
```

```python
from asok.templates import SafeString
return request.html('page.html', html=SafeString('<b>bold</b>'))
```

The `escape` (alias `e`) filter forces escaping if needed.

**Security Note**: String literals in template expressions are protected from keyword interference. For example, `{{ t('2FA is Enabled') }}` correctly treats the entire string as a literal, even though it contains the `is` keyword. The template compiler only processes `is` tests (like `user is defined`) outside of quoted strings, preventing accidental keyword matching within your text content.

## Filters

```html
{{ name | upper }}                    → "HELLO"
{{ name | lower }}                    → "hello"
{{ name | capitalize }}               → "Hello"
{{ name | title }}                    → "Hello World"
{{ text | truncate(50) }}             → "Long text..."
{{ text | replace('old', 'new') }}    → replaced string
{{ items | join(', ') }}              → "a, b, c"
{{ value | default('N/A') }}          → "N/A" if empty
{{ html | striptags }}                → text without HTML tags
{{ items | length }}                  → 3
{{ date | date('%d/%m/%Y') }}         → "04/04/2026"
{{ count | pluralize('item', 'items') }} → "items"
{{ value | abs }}                      → absolute value
{{ data | tojson }}                   → JSON string
{{ items | first }}                   → first element
{{ items | last }}                    → last element
{{ html | safe }}                     → trusted, not escaped
{{ value | escape }}                  → forced escape (alias: e)
```

### Humanize Filters

Asok includes a set of human-friendly formatting filters for common data types:

| Filter | Example | Description |
|---|---|---|
| `time_ago` | `{{ user.created_at | time_ago }}` | "2 hours ago", "just now", "3 days ago" |
| `filesize` | `{{ file.size | filesize }}` | "1.2 MB", "450 KB", "0 B" |
| `intcomma` | `{{ 1200 | intcomma }}` | "1,200" (adds thousands separators) |
| `duration` | `{{ seconds | duration }}` | "5m 20s", "1h 10m", "2d 4h" |

### Base64 Image Filter (v0.1.4+)

The `decode_base64` filter converts base64-encoded images (like signatures) into `<img>` tags:

```html
<!-- Simple usage -->
{{ user.signature | decode_base64 }}

<!-- With Tailwind CSS -->
{{ user.signature | decode_base64(class_="w-64 h-32 border border-gray-300 rounded") }}

<!-- With custom styling -->
{{ user.signature | decode_base64(style="max-width:300px;border:1px solid #ccc") }}

<!-- Multiple attributes -->
{{ user.avatar | decode_base64(class_="profile-img", width="200", height="200") }}
```

This is particularly useful for displaying signatures from signature pads or any base64-encoded images stored in the database.

**Note:** Use `class_` with an underscore to avoid conflicts with Python's `class` keyword.

Chain filters:

```html
{{ name | lower | truncate(20) }}
```

### Filter blocks

Apply filters to entire blocks of template content:

```html
{% filter upper %}
  This entire block will be uppercased.
  {{ user.name }} will also be uppercased.
{% endfilter %}

{% filter truncate(50) | safe %}
  <p>Long HTML content that will be truncated...</p>
{% endfilter %}
```

You can chain multiple filters in a filter block just like inline filters.

## Autoescape control

By default, all template output is automatically HTML-escaped. You can control this behavior for entire blocks:

```html
{# Disable auto-escape for trusted content #}
{% autoescape false %}
  {{ trusted_html_content }}
  <p>Raw HTML here: {{ user.bio }}</p>
{% endautoescape %}

{# Re-enable auto-escape (though it's on by default) #}
{% autoescape true %}
  {{ user_input }}  {# Will be escaped #}
{% endautoescape %}
```

**Security Warning**: Only use `autoescape false` for content you completely trust. Untrusted user input should always be escaped to prevent XSS attacks. Prefer using the `safe` filter for individual variables instead of disabling autoescape for entire blocks.

## Conditions

```html
{% if user.is_admin %}
    <span>Admin</span>
{% elif user.is_authenticated %}
    <span>{{ user.name }}</span>
{% else %}
    <a href="/login">Login</a>
{% endif %}
```

### Template tests — `is` operator

Test variables with the `is` operator for common conditions:

```html
{% if user is defined %}
    Welcome, {{ user.name }}!
{% endif %}

{% if items is not defined or items is none %}
    <p>No items available</p>
{% endif %}

{% if count is even %}
    <div class="even-row">{{ count }}</div>
{% endif %}

{% if status is true %}
    <span class="active">Active</span>
{% endif %}
```

Available tests:

| Test | Description | Example |
|------|-------------|---------|
| `defined` | Value exists and is not empty string | `{% if user is defined %}` |
| `undefined` | Value is None or empty string | `{% if email is undefined %}` |
| `none` | Value is exactly None | `{% if result is none %}` |
| `true` | Value is exactly True | `{% if active is true %}` |
| `false` | Value is exactly False | `{% if disabled is false %}` |
| `even` | Number is even | `{% if count is even %}` |
| `odd` | Number is odd | `{% if count is odd %}` |
| `string` | Value is a string | `{% if name is string %}` |
| `number` | Value is int or float | `{% if price is number %}` |
| `boolean` | Value is True or False | `{% if flag is boolean %}` |
| `integer` | Value is an integer | `{% if age is integer %}` |
| `float` | Value is a float | `{% if price is float %}` |
| `sequence` | Value is list or tuple | `{% if items is sequence %}` |
| `mapping` | Value is a dictionary | `{% if data is mapping %}` |
| `iterable` | Value can be iterated | `{% if collection is iterable %}` |
| `lower` | String is all lowercase | `{% if text is lower %}` |
| `upper` | String is all uppercase | `{% if code is upper %}` |

Negate any test with `is not`:

```html
{% if user is not defined %}
    <a href="/login">Please log in</a>
{% endif %}
```

## Loops

```html
{% for post in posts %}
    <h2>{{ post.title }}</h2>
    <p>{{ post.body | truncate(100) }}</p>
{% endfor %}
```

### Loop state

Inside a loop, the `loop` variable provides state:

| Property | Description |
|---|---|
| `loop.index` | 1-based index (1, 2, 3...) |
| `loop.index0` | 0-based index (0, 1, 2...) |
| `loop.first` | True if first iteration |
| `loop.last` | True if last iteration |
| `loop.length` | Total number of items |

Example:

```html
<ul>
{% for item in items %}
    <li class="{{ 'first' if loop.first else '' }}">
        {{ loop.index }}: {{ item }}
    </li>
{% endfor %}
</ul>
```

### Loop control

You can use `{% break %}` to exit a loop early and `{% continue %}` to skip to the next iteration:

```html
{% for user in users %}
    {% if user.is_banned %}{% continue %}{% endif %}
    <li>{{ user.name }}</li>
    {% if loop.index == 10 %}{% break %}{% endif %}
{% endfor %}
```

## Variables

### Inline assignment

```html
{% set greeting = 'Hello' %}
{% set total = items | length %}
<h1>{{ greeting }}, {{ name }}!</h1>
```

### Block assignment — capture template content

Capture rendered template content into a variable using block `set`:

```html
{% set message %}
  <p>Welcome <strong>{{ user.name }}</strong>!</p>
  <p>You have {{ notifications | length }} new notifications.</p>
{% endset %}

<!-- Later in template -->
<div class="alert">{{ message }}</div>

<!-- Or pass to a macro -->
{{ card(message, title="User Info") }}
```

This is useful for:
- Building complex HTML strings
- Capturing repeated content blocks
- Passing template fragments to macros or functions

### Side effects — `do`

Execute an expression without outputting anything to the template. Useful for calling methods that modify state or for complex assignments:

```html
{% do request.session.set('viewed', True) %}
{% do my_list.append(item) %}
```


## Template inheritance

### Base layout

```html
<!-- src/partials/html/base.html -->
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}{% endblock %}</title>
    {% block styles %}{% endblock %}
</head>
<body>
    {% include "html/navbar.html" %}
    <main>{% block main %}{% endblock %}</main>
    {% block scripts %}{% endblock %}
</body>
</html>
```

### Child page

```html
<!-- src/pages/about/page.html -->
{% extends "html/base.html" %}

{% block title %}About{% endblock %}

{% block main %}
<h1>About us</h1>
{% endblock %}
```

## Includes

```html
{% include "html/navbar.html" %}
{% include "html/footer.html" %}
```

Paths are relative to `src/partials/`.

## Macros

Define reusable components in a separate file:

```html
<!-- src/partials/html/macros.html -->
{% macro button(text, cls="primary") %}
<button class="{{ cls }}">{{ text }}</button>
{% endmacro %}

{% macro card(title, body) %}
<div class="card">
  <h3>{{ title }}</h3>
  <p>{{ body }}</p>
</div>
{% endmacro %}
```

Import and use in any template:

```html
{% from "html/macros.html" import button, card %}

{{ button("Click me") }}
{{ button("Delete", "danger") }}
{{ card("Hello", "World") }}

### Advanced Macros — `call`

The `{% call %}` block allows you to pass a block of template code to a macro, which can then be rendered using the special `caller()` function. This is similar to component slots but for macros.

**Definition:**
```html
{% macro card_wrap(title) %}
<div class="card">
  <div class="header">{{ title }}</div>
  <div class="body">
    {{ caller() | safe }}
  </div>
</div>
{% endmacro %}
```

**Usage:**

```html
{% from "macros.html" import card_wrap %}

{% call card_wrap("Advanced Card") %}
  <p>This content is passed to <strong>caller()</strong>.</p>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
{% endcall %}
```

Output:

```html
<button class="primary">Click me</button>
<button class="danger">Delete</button>
<div class="card">
  <h3>Hello</h3>
  <p>World</p>
</div>
```

Macro bodies support the full template syntax (variables, filters, conditions, loops). Paths are relative to `src/partials/`.

## Scoped variables — `with`

```html
{% with total = items | length %}
  <p>{{ total }} items</p>
{% endwith %}
```

## Raw blocks

Disable template parsing inside a block (useful when outputting `{{ }}` literally for JS frameworks):

```html
{% raw %}
  <p>{{ this_is_not_parsed }}</p>
{% endraw %}
```

## Comments

```html
{# This won't appear in the output #}
```

## Method calls

```html
{{ request.csrf_input() }}
{{ user.to_dict() }}
```

## Passing variables from Python

```python
def render(request: Request):
    return request.html('page.html',
        name='World',
        posts=Post.all(),
        count=Post.count()
    )
```

All kwargs become template variables.

## Built-in context

Every template has these available automatically:

| Variable | Description |
|---|---|
| `request` | The current Request object |
| `__('key')` | Translation function |
| `static('path')` | Static file URL helper |
| `get_flashed_messages()` | Flash messages list |

## Partial rendering (blocks)

For partial updates or single-page application (SPA) scenarios, `request.block()` renders only the content of a specific `{% block %}` instead of the full page.

```python
def render(request: Request):
    if request.method == "POST":
        # Return only the "form" block after submission
        return request.block("page.html", "form", success=True)
    return request.html("page.html")
```

Template (`page.html`):

```html
{% extends "html/base.html" %}
{% block main %}
  <h1>Contact</h1>
  {% block form %}
    {% if success %}
      <p>Message sent!</p>
    {% else %}
      <form method="POST" hx-post="/contact" hx-target="#form" hx-swap="innerHTML">
        <input name="email" />
        <button type="submit">Send</button>
      </form>
    {% endif %}
  {% endblock %}
{% endblock %}
```

`request.block("page.html", "form", success=True)` returns only the inner content of `{% block form %}`, without the parent layout (`<html>`, `<head>`, etc.).

If the block name doesn't exist, a `ValueError` is raised.

### Clean Blocks for SEO

By default, Asok injects HTML comment markers (`<!-- block:name:start -->`) around template blocks to support SPA partial updates. However, for sensitive blocks that end up in browser tab titles or meta tag attributes, these markers are automatically excluded:

- **`title` block**: Content is rendered cleanly so it doesn't appear in the browser tab title as comments.
- **`description` block**: Content is rendered cleanly to prevent breaking meta tag `content` attributes.

The SPA engine is intelligent enough to target these blocks directly (using the `<title>` and `<meta>` tags) even without the comment markers.

You can also use `render_block_string()` directly:

```python
from asok.templates import render_block_string

html = render_block_string(template_content, "form", {"success": True}, root_dir="src/partials")
```

## Live updates (data-* attributes)

Asok ships a small inline JS runtime (no external dependency) that lets you build reactive pages with HTML attributes — search-as-you-type, infinite scroll, inline delete, polling, SSE, etc. — without writing custom JavaScript.

The runtime is auto-injected into every full HTML response. You don't import anything.

### `data-block` — swap server fragments into the DOM

The simplest case: a form (or link) submits via `fetch` and the response replaces the contents of a target element.

```html
<form method="post" data-block="result">
  {{ request.csrf_input() }}
  <input name="email">
  <button>Subscribe</button>
</form>
<div id="result">
  {% block result %}{% endblock %}
</div>
```

Server side:

```python
from asok import Request, Form

def render(request: Request):
    form = Form({'email': Form.email('Email', 'required|email')}, request)
    if form.validate():
        Subscriber.create(**form.data)
        request.flash('success', 'Subscribed!')
    return request.html('page.html', form=form)
```

The framework detects the partial request via the `X-Block` header and you can serve a fragment (`request.block("page.html", "result")`) or the full page — both work. CSRF tokens are rotated automatically and re-injected into the new DOM.

The `data-block` attribute targets a template block by its name.

- **`data-block="main"`** — Targets a template block named `main`.

```html
<div id="main">
  {% block main %}
    Content will be replaced here
  {% endblock %}
</div>
```

When using `data-block`, the server should return the specific fragment using `request.block("template.html", "main")`.

**Examples:**

```html
<!-- Target template block "content" -->
<form data-block="content" data-url="/update">...</form>
<!-- Server: return request.block("page.html", "content") -->

<!-- Target template block "result" -->
<form data-block="result" data-url="/search">...</form>
<!-- Server: return request.block("page.html", "result") -->
```

### `data-trigger` — fire on different events

By default forms fire on `submit` and links on `click`. `data-trigger` overrides this:

```html
<!-- Search-as-you-type with debounce -->
<input data-block="results"
       data-url="/search"
       data-trigger="input delay:300ms"
       name="q" placeholder="Search…">

<!-- Filter that reloads on change -->
<select data-block="results"
        data-url="/list"
        data-trigger="change"
        name="category">...</select>

<!-- Auto-save on blur -->
<textarea data-block="status"
          data-url="/draft"
          data-method="POST"
          data-trigger="blur"
          name="body"></textarea>

<!-- Lazy load (fire once on page load) -->
<div id="notifs" data-block="notifs" data-url="/notifications" data-trigger="load">
  {% block notifs %}{% endblock %}
</div>

<!-- Polling every 5 seconds -->
<div id="stats" data-block="stats" data-url="/stats" data-trigger="every 5s">
  {% block stats %}{% endblock %}
</div>
```

Accepted formats: any DOM event name (`submit`, `click`, `change`, `input`, `blur`, `focus`, …), plus the special triggers `load` (fire once at page load) and `every Ns` / `every Nms` (polling). Add `delay:Nms` to debounce.

### `data-swap` — swap strategy

The default is `innerHTML`. Other modes:

```html
<!-- Delete a row in place after a server action -->
<button data-block="row-42"
        data-url="/rows/42"
        data-method="POST"
        data-swap="delete">×</button>

<!-- Infinite scroll: append the response instead of replacing -->
<button data-block="rows"
        data-url="/rows?page=2"
        data-swap="beforeend">Load more</button>

<!-- New chat message at the top -->
<form data-block="msgs" data-swap="afterbegin">...</form>

<!-- Replace the element itself (for inline row editing) -->
<form data-block="row-42" data-swap="outerHTML">...</form>
```

| Mode | Behavior |
|---|---|
| `innerHTML` *(default)* | Replace target's content |
| `outerHTML` | Replace target itself |
| `beforebegin` | Insert HTML before target |
| `afterbegin` | Insert HTML at start of target |
| `beforeend` | Insert HTML at end of target (append) |
| `afterend` | Insert HTML after target |
| `delete` | Remove target from the DOM |
| `none` | Do nothing (useful for fire-and-forget) |

### `data-push-url` — update history & support Back button

```html
<a href="/users/42" data-block="main" data-push-url>View</a>
```

After the swap, `history.pushState` updates the URL. Pressing Back triggers `popstate` and asok re-fetches the previous URL into the same target with the same swap mode — full SPA feel without a SPA framework.

You can also push a custom URL: `data-push-url="/custom-url"`.

### `data-indicator` — loading state

```html
<form data-block="list" data-indicator="#spinner">...</form>
<div id="spinner" hidden>Loading…</div>
```

During the fetch, the class `is-loading` is added to the indicator element; it's removed on success or error. Style `.is-loading` however you want:

```css
.is-loading { opacity: .5; pointer-events: none; }
```

`data-indicator` without a value uses the trigger element itself as the indicator.

### `data-disable` — anti double-submit

```html
<form data-block="result" data-disable>
  <button type="submit">Save</button>
</form>
```

Disables every `<button>` and `<input type="submit">` inside the form during the request. On a non-form element (e.g. a button alone), it disables the element itself.

### `data-include` — combine inputs from elsewhere

```html
<select id="cat" name="category">
  <option value="">All</option>
  <option value="tech">Tech</option>
</select>

<input data-block="results"
       data-url="/search"
       data-trigger="input delay:300ms"
       data-include="#cat"
       name="q">
```

The fetch will combine `q=...&category=...`. The selector can match multiple elements (e.g. `data-include=".filter"`).

### `data-confirm` — native confirmation

```html
<a data-block="row-42"
   data-url="/users/42/delete"
   data-method="POST"
   data-swap="delete"
   data-confirm="Delete this user?">×</a>
```

Shows a `confirm()` dialog before firing. Cancel = no fetch, no swap, no indicator. Works on any `data-block` element.

### `data-sse` — Server-Sent Events stream

```html
<!-- Live notifications -->
<div id="notifs" data-sse="/events/notifications">
  {% block notifs %}{% endblock %}
</div>

<!-- Append-only log -->
<div id="log" data-sse="/events/log" data-block="log" data-swap="beforeend">
  {% block log %}{% endblock %}
</div>
```

Each SSE message is treated as HTML and swapped according to `data-swap` (default `innerHTML`). The target is `data-block` or, if absent, the element itself by its `id`.

Server side, return any handler that streams `text/event-stream`:

```python
import time

def render(request):
    def gen():
        while True:
            html = request.render_string("partials/notifs.html", items=Notif.latest())
            yield f"data: {html}\n\n"
            time.sleep(5)
    return request.stream(gen(), content_type="text/event-stream")
```

### Out-of-band swaps (multi-target updates)

Sometimes a single server response needs to update several places at once. Wrap each fragment in a `<template data-block="sel">` element. When the JS sees these in the response, it swaps each one independently:

```html
<!-- Server response from a delete handler -->
<template data-block="row-42" data-swap="delete"></template>
<template data-block="flash" data-swap="afterbegin">
  <div class="flash success">User deleted</div>
</template>
<template data-block="user-count">23</template>
```

Three updates from one round-trip: row removed, flash shown at top, counter refreshed.

### Reference

| Attribute | Role |
|---|---|
| `data-block="name"` | Template block name to render and replace |
| `data-target="#sel"` | Override the target (defaults to first selector of `data-block`) |
| `data-url="..."` | Explicit URL (required on non-form/non-link elements) |
| `data-method="GET|POST"` | HTTP method (default GET for non-form, form's method for form) |
| `data-trigger="event [delay:Nms]"` | Trigger event + optional debounce |
| `data-swap="mode"` | Swap strategy (see table above) |
| `data-push-url[="url"]` | Update history + handle Back button |
| `data-indicator[="#sel"]` | Add `.is-loading` during fetch |
| `data-disable` | Disable form/button during fetch |
| `data-include="selector"` | Include other inputs in the request |
| `data-confirm="message"` | Show confirm() before firing |
| `data-sse="url"` | Open SSE stream and swap on each message |

### How data is collected

| Element | Body / query |
|---|---|
| `<form data-block>` | Its FormData (POST body or GET querystring) |
| `<a data-block>` | GET on its `href` |
| `<input data-block>` inside a form | The form's FormData (so search-as-you-type sends every filter) |
| `<input data-block>` outside a form | Just `name=value` |
| Any other element with `data-url` | No body — pure fetch |

The runtime auto-includes the CSRF token in the `X-CSRF-Token` header and rotates it transparently after every request.

For complex client-side interactivity (state, loops, conditional rendering), Asok includes a native directive system that runs entirely in the browser.

Unlike `data-block` which relies on server round-trips, `asok-*` directives handle reactivity locally using a browser-side state.

```html
<div asok-state="{ count: 0 }">
  <button asok-on:click="count++">Increment</button>
  <p>Count: {{ count }}</p>
</div>
```

For the full reference of all available directives, see the [Asok Directives](29-asok-directives.md) documentation.

## WebSocket helper

In addition to SSE, asok can run a WebSocket server in a daemon thread alongside the HTTP server (see [WebSockets](28-websocket.md)). A small JS helper is auto-injected for the client side:

```html
<script>
var sock = asokWS('/chat');
sock.onmessage = function(e) { console.log(e.data); };
sock.send('hello');
</script>
```

`asokWS(path)` returns a `WebSocket` instance and resolves the URL automatically: `ws://localhost:8001/chat` in dev, `wss://yoursite.com/ws/chat` in production (assuming nginx proxies `/ws/` to your WebSocket port). The port can be configured via `app.config['WS_PORT']` (defaults to `8001`).

## Component Slots (Transclusion)

Asok supports passing arbitrary HTML blocks into components using the `{% component %}...{% endcomponent %}` block tag. This is useful for creating layout components (like cards, modals, or page layouts) where the content isn't known in advance.

Inside the component, you access the passed content via the `{{ slot }}` variable.

### Example: A Generic Card Component

`src/components/Card.html`:
```html
<div class="card">
    <div class="card-header">
        <h3>{{ title }}</h3>
    </div>
    <div class="card-body">
        {{ slot }} <!-- The content from the parent goes here -->
    </div>
</div>
```

`src/pages/index.html`:
```html
{% component "Card", title="Welcome" %}
    <p>This is the <strong>body</strong> of the card.</p>
    <button data-block="more" data-url="/more">Load more</button>
{% endcomponent %}
```

- Content inside the component block is automatically marked as safe HTML.
- Nested components are supported: you can have a component inside another component's slot.
- Components within slots retain their full functionality (reactive state, event handlers, etc.).

## Performance

Templates are compiled to Python functions and cached automatically. The first render of a template triggers:

1. Inheritance/includes resolution (file reads)
2. Regex parsing into tokens
3. Python code generation
4. `exec()` to create a callable function

On subsequent renders of the same template, the compiled function is reused directly — no parsing, no `exec()`. This makes template rendering as fast as calling a regular Python function.

---
[← Previous: Request Handling](03-request.md) | [Documentation](README.md) | [Next: Middleware →](05-middleware.md)
