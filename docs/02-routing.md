# Routing

Asok uses a **file-based router**. The directory structure of `src/pages/` defines your URLs.

## Basic routing

| URL | File path |
|---|---|
| `/` | `src/pages/page.py` (or `page.html`) |
| `/about` | `src/pages/about/page.py` |
| `/contact` | `src/pages/contact/page.py` |
| `/blog` | `src/pages/blog/page.py` |

## Index files

By default, Asok looks for a file named `page.py` or `page.html` inside a folder.

- `src/pages/page.py` → `/`
- `src/pages/auth/login/page.py` → `/auth/login`

You can change this default name in your configuration:
`app.config['INDEX'] = "index"` would look for `index.py`.

## Dynamic parameters

To capture variables from the URL, use square brackets in the folder name.

| URL | Folder path | Param |
|---|---|---|
| `/user/42` | `src/pages/user/[id]/page.py` | `request.params['id'] == "42"` |
| `/blog/my-post` | `src/pages/blog/[slug]/page.py` | `request.params['slug'] == "my-post"` |

### Parameter types

You can optionally specify a type for automatic validation and conversion:

- `[id:int]` — matches digits only, `request.params['id']` is a Python `int`
- `[name:str]` — matches any string (default)
- `[uid:uuid]` — matches a UUID string
- `[path:path]` — matches multiple segments (e.g. `/docs/[path:path]` matches `/docs/api/routing`)

Example: `src/pages/product/[id:int]/page.py`
If a user visits `/product/abc`, Asok returns a **404 Not Found** because "abc" is not an integer.

## Request methods

Every page can handle different HTTP methods by defining `get()`, `post()`, `put()`, `delete()`, etc.

```python
# src/pages/contact/page.py

def get(request):
    return request.html('contact.html')

def post(request):
    # Process form...
    request.flash('success', 'Thank you!')
    return request.redirect('/contact')
```

If a specific method is not defined, Asok falls back to the `render()` function. If neither is defined, it returns **405 Method Not Allowed**.

## Pure HTML pages

For simple static pages, you don't even need a `.py` file. Just create a `.html` file:

`src/pages/about/page.html` → serves this HTML at `/about`.

## Static files

Files in `src/partials/` are served at `/static/`.

| File path | URL |
|---|---|
| `src/partials/css/base.css` | `/css/base.css` |
| `src/partials/js/base.js` | `/js/base.js` |
| `src/partials/images/logo.svg` | `/images/logo.svg` |

Use `static()` in templates:

```html
<link rel="stylesheet" href="{{ static('css/base.css') }}">
<img src="{{ static('images/logo.svg') }}">
```

## Custom error pages

Create a page for any HTTP error code:

- `src/pages/404/page.html`: Custom 404 page
- `src/pages/403/page.html`: Custom 403 page (triggered by CSRF failures or security protection)
- `src/pages/500/page.html`: Custom 500 page
- `src/pages/429/page.html`: Custom 429 page (Rate limiting)

```html
<!-- src/pages/404/page.html -->
{% extends "html/base.html" %}

{% block main %}
<h1>Page not found</h1>
<p>Sorry, this page doesn't exist.</p>
<a href="/">Go home</a>
{% endblock %}
```

In production (`DEBUG=false`), the 500 page is shown instead of the raw error.

---
[← Previous: Getting Started](01-getting-started.md) | [Documentation](README.md) | [Next: Request Handling →](03-request.md)
