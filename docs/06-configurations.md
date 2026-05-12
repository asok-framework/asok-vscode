# Configurations

Asok is designed to be "zero-config" by default, but it provides a comprehensive set of options that can be tuned via environment variables or directly in your `wsgi.py` file.

## 1. Core Settings

| Key | Type | Default | Description |
|---|---|---|---|
| `DEBUG` | bool | `False` | Enables detailed error pages, auto-reloading. Set to `True` for development. |
| `SECRET_KEY` | str | *auto* | Used for signing cookies, tokens, and CSRF protection. **Required (min 32 chars)** in production. |
| `INDEX` | str | `"page"` | The name of the default entry point file in your page directories. |
| `LOCALE` | str | `"en"` | The default language code for translations. |
| `PROJECT_NAME` | str | `"Asok App"` | The display name of your project. |
| `VERSION` | str | `"0.1.0"` | Your application's current version. |
| `ASOK_WRITE_BYTECODE` | bool | `False` | Set to `true` to allow Python to write `.pyc` files (disabled by default for a cleaner project). |

## 2. Server & Routing

| Key | Type | Default | Description |
|---|---|---|---|
| `APP_URL` | str | `None` | The base URL of your app (e.g., `https://example.com`). **Mandatory in production** for Magic Links. |
| `ASOK_PORT` | int | `8000` | The default port for the `asok dev` and `asok preview` commands. |
| `WS_PORT` | int | `8001` | The port used by the built-in WebSocket server. |
| `MAX_CONTENT_LENGTH` | int | `10485760` | Maximum allowed size (in bytes) for request bodies (default 10 MB). |
| `TRUSTED_PROXIES` | list/str | `None` | List of IP addresses (or `"*"` ) to trust for the `X-Forwarded-For` header. |
| `ASOK_DOCS` | bool | `DEBUG` | Alias for `DOCS`. Set to `false` to hide the documentation UI entirely. |
| `DOCS` | bool | `DEBUG` | Enables or disables the automatic documentation UI. |

## 3. Session Management

| Key | Type | Default | Description |
|---|---|---|---|
| `SESSION_BACKEND` | str | `"memory"` | Storage backend for sessions: `"memory"` or `"file"`. |
| `SESSION_PATH` | str | `".asok/sessions"` | Directory path for file-based session storage. |
| `SESSION_MAX_AGE` | int | `2592000` | Max age for the session cookie (in seconds, default 30 days). |
| `SESSION_TTL` | int | `86400` | Server-side session expiration time (in seconds, default 24 hours). |

## 4. Security & CORS

| Key | Type | Default | Description |
|---|---|---|---|
| `CSRF` | bool | `True` | Enables global Cross-Site Request Forgery protection for forms. |
| `CORS_ORIGINS` | list/str | `None` | Allowed origins for cross-domain requests. Use `"*"` for all. |
| `SECURITY_HEADERS` | bool/dict | `True` | Enables default security headers (CSP, HSTS, etc.). Can be customized with a dict. |
| `ETAG` | bool | `True` | Enables automatic conditional caching headers for responses. |

## 5. Performance & Optimization

| Key | Type | Default | Description |
|---|---|---|---|
| `GZIP` | bool | `False` | Enables transparent Gzip compression for text-based responses. |
| `GZIP_MIN_SIZE` | int | `500` | Minimum response size (in bytes) to trigger Gzip compression. |
| `HTML_MINIFY` | bool | `!DEBUG` | Enables aggressive whitespace removal for HTML responses. |
| `IMAGE_OPTIMIZATION` | bool | `False` | Enables automatic WebP conversion for uploaded/served images. |
| `IMAGE_KEEP_ORIGINAL` | bool | `True` | Retains the original uploaded file when generating optimized versions. |

## 6. Database & ORM

Asok uses SQLite for simplicity. Most database settings are handled automatically.

| Key | Type | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | str | `"sqlite:///db.sqlite3"` | Path to the SQLite database file. |

## 7. Email Configuration

| Key | Type | Default | Description |
|---|---|---|---|
| `MAIL_HOST` | str | `"localhost"` | SMTP server hostname. |
| `MAIL_PORT` | int | `587` | SMTP server port. |
| `MAIL_USERNAME` | str | `None` | Username for SMTP authentication. |
| `MAIL_PASSWORD` | str | `None` | Password for SMTP authentication. |
| `MAIL_FROM` | str | `"noreply@..."` | Default sender address. |
| `MAIL_TLS` | bool | `True` | Use TLS for secure email transmission. |

## 8. Logging

| Key | Type | Default | Description |
|---|---|---|---|
| `LOG_LEVEL` | str | `"DEBUG"` | Minimal logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |
| `LOG_FILE` | str | `None` | Optional path to a file for persistent logging. |
| `LOG_FORMAT` | str | `"text"` | Format of logs: `"text"` or `"json"` for structured logging. |

## 9. API & Documentation UI

| Key | Type | Default | Description |
|---|---|---|---|
| `DOCS_PATH` | str | `"/docs"` | The URL path where the auto-generated docs are served. |
| `OPENAPI_PATH` | str | `"/openapi.json"` | The URL path for the generated OpenAPI specification. |
| `API_TITLE` | str | *PROJECT_NAME* | The title shown in the documentation UI. |
| `API_LOGO` | str | *SITE_LOGO* | URL of the logo shown in the documentation UI. |

## 10. Admin Interface

The Admin interface is initialized by passing parameters to the `Admin` extension class in `wsgi.py`.

| Param | Type | Default | Description |
|---|---|---|---|
| `site_name` | str | `"Asok Admin"` | Branding title shown in the sidebar and page titles. |
| `url_prefix` | str | `"/admin"` | The URL path where the admin interface is served. |
| `default_locale`| str | `"en"` | Default language for the admin interface. |
| `favicon` | str | `None` | Path to a custom logo/favicon (resolves to `src/partials/` if path provided). |
| `login_rate_limit`| tuple | `(5, 900)` | Bruteforce protection: `(max_attempts, window_seconds)`. |

## 11. Advanced Session Settings

| Key | Type | Default | Description |
|---|---|---|---|
| `SESSION_SAMESITE` | str | `"Lax"` | SameSite attribute for the session cookie (`Lax`, `Strict`, or `None`). |
| `SESSION_SECURE` | bool | *auto* | Forces session cookie to be sent over HTTPS only. Defaults to `True` if not in `DEBUG`. |

## 12. Mandatory Production Settings

When running Asok in production (`DEBUG=False`), certain configurations are strictly enforced to ensure the security of your application. The framework will raise a `RuntimeError` on startup if these are missing or insecure.

### Required Variables

| Key | Requirement | Rationale |
|---|---|---|
| **`SECRET_KEY`** | Must be at least **32 characters** | Used for HMAC signing of sessions, CSRF tokens, and secure cookies. |
| **`APP_URL`** | Must be a valid URL (e.g., `https://example.com`) | Required to prevent Host Header Injection and to generate absolute URLs for Magic Links. |

### How to Configure

You can define your configurations in two ways. Asok will merge them, with `wsgi.py` settings taking precedence over `.env`.

#### Option A: Using a `.env` file (Recommended)

Create a `.env` file in your project root. This is the preferred method for sensitive secrets.

```env
DEBUG=false
SECRET_KEY=your-ultra-secure-64-character-key-here
APP_URL=https://myapp.com
DATABASE_URL=sqlite:///data/prod.db
```

#### Option B: In your `wsgi.py`

You can set configurations directly on the `app` instance using the `config` dictionary.

```python
from asok import Asok

app = Asok()

# Production overrides
app.config["DEBUG"] = False
app.config["SECRET_KEY"] = "your-ultra-secure-64-character-key-here"
app.config["APP_URL"] = "https://myapp.com"
```

> In production, `DEBUG` defaults to `False`. You only need to set it to `True` explicitly in your development environment.

---
[← Previous: Middleware](05-middleware.md) | [Documentation](README.md) | [Next: ORM Basics →](07-orm.md)
