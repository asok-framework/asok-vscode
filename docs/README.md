# Asok Documentation

> **Latest Version: v0.1.4** (Development)
> - **ORM Indexes**: Database indexes for performance (`Field.String(index=True)`).
> - **Union/Intersect Queries**: Combine multiple queries with SQL UNION and INTERSECT.
> - **Subqueries**: Use queries in `WHERE IN` clauses for advanced filtering.
> - **18 New Form Fields**: Complete UI toolkit with toggle, OTP, rating stars, autocomplete, WYSIWYG editor, signature pad, drag & drop, tree select, transfer list, phone international, and more.
> - **New Template Filter**: `decode_base64` filter for displaying base64 images (signatures, avatars) with customizable HTML attributes.
> - Added 9 new validation rules (`url`, `slug`, `uuid`, `numeric`, `digits`, `boolean`, `between`, `month`, `base64`).
> - Enhanced Admin security: Improved CSRF handling and global error catching.
> - Improved Developer UX: `ModelAdmin` base class for full IDE autocompletion.
> - Security hardening: ReDoS protection on all validation regex.
> - Template Engine: Added `{% break %}`, `{% continue %}`, `{% do %}`, `{% with %}`, and `{% call %}` support.
> - SEO Hardware: Automatic suppression of SPA markers in `title` and `description` blocks for clean browser tab titles.
> - ORM Power User: Added `group_by()` and `select()` to Query builder; improved table naming with `snake_case` pluralization.
> - Auto-Migrations: Automatic `ALTER TABLE` on schema change (Zero-Config DB evolution).
> - Real-time Live Data: `data-subscribe` for instant UI updates when models change in the DB.
> - **Developer Toolbar**: Premium console with real-time SQL profiler (AJAX/SPA support), session inspector, and reactive state monitor.
> - Serialization: Implemented automatic request context detection in `Schema` via `contextvars`.

Welcome to the official Asok Framework documentation. This guide is organized sequentially to take you from a total beginner to an advanced contributor.

## 🟢 Foundations
01. [Getting Started](01-getting-started.md) — Installation and your first app.
02. [Routing](02-routing.md) — Defining URLs and dynamic parameters.
03. [Request Handling](03-request.md) — Working with headers, queries, and bodies.
04. [Templates](04-templates.md) — The Asok template engine syntax.
05. [Middleware](05-middleware.md) — Intercepting and modifying requests.
06. [Configurations](06-configurations.md) — Managing environment and app settings.

## 📊 Database & ORM
07. [ORM Basics](07-orm.md) — Models and basic Queries.
08. [Advanced ORM](08-advanced-orm.md) — Indexes, Union/Intersect, Subqueries, and complex filtering.
09. [Migrations](09-migrations.md) — Versioned database schema management.
10. [Native Vector Search](10-vector-search.md) — AI-ready semantic search with SQLite.

## 📝 Forms & Data
11. [Forms](11-forms.md) — Declarative HTML forms and model mapping.
12. [Advanced Forms](12-advanced-forms.md) — Enums, JSON, and custom field types.
13. [Form Actions](13-form-actions.md) — Handling submissions without complex routing.
14. [Validation](14-validation.md) — Built-in validation rules and custom logic.
15. [Serialization](15-serialization.md) — Controlling JSON output with Schemas.
16. [File Storage](16-file-storage.md) — Handling uploads and serving files.

## 🔒 Security & Auth
17. [Authentication](17-authentication.md) — Sessions, Login, and Register.
18. [Advanced Authentication](18-advanced-authentication.md) — Magic Links, OAuth2, and API Tokens.
19. [Sessions](19-sessions.md) — Managing persistent user data.
20. [Security Headers](20-security-headers.md) — Production hardening (CSP, HSTS, etc.).
21. [CORS & Gzip](21-cors-gzip.md) — Cross-origin requests and compression.
22. [Rate Limit](22-rate-limit.md) — Protecting your app from brute-force/abuse.
23. [Security Audit](23-security-audit.md) — Current state of framework hardening.

## ✨ Reactive UI
24. [Reactive Components](24-reactive-components.md) — Stateful WebSocket-powered UI.
25. [Transitions](25-transitions.md) — Svelte-like animations for your UI.
26. [HTML Streaming](26-html-streaming.md) — Optimizing TTFB with chunked delivery.
27. [Scoped JS & CSS](27-scoped-assets.md) — Page-specific, isolated assets.
28. [Intelligent Prefetching](28-intelligent-prefetching.md) — Instant-feel navigation.
29. [Asok Directives](29-asok-directives.md) — Lightweight client-side reactivity.

## 🛠️ Internal Tools
30. [Admin Interface](30-admin-interface.md) — 2FA, Roles, Impersonation & Media.
31. [API Development](31-api-development.md) — Building JSON APIs with auto-docs.
32. [WebSockets](32-websockets.md) — Real-time bidirectional communication.
33. [Email Service](33-email-service.md) — Sending SMTP emails in the background.
34. [Caching](34-caching.md) — Performance boost with memory/file caching.
35. [Background Tasks](35-background-tasks.md) — Non-blocking function execution.
36. [Scheduled Tasks](36-scheduler.md) — Recurring cron-like jobs.

## 🚀 Operations & Tools
37. [Internationalization](37-internationalization.md) — Multi-language support (i18n).
38. [CLI Reference](38-cli-reference.md) — All `asok` command-line tools.
39. [Deployment](39-deployment.md) — Production setup (Gunicorn, Nginx, SystemD).
40. [Testing](40-testing.md) — Unit and integration testing with TestClient.
41. [Logging](41-logging.md) — Request and application logs.
42. [Optimization](42-optimization.md) — Minification, WebP, and performance tips.
43. [Static Versioning](43-static-versioning.md) — Cache busting for static assets.
44. [Production Build](44-production-build.md) — Packaging and obfuscation.
45. [Data Tables](45-data-tables.md) — High-performance interactive tables.
46. [Developer Toolbar](46-developer-toolbar.md) — Real-time SQL profiler, AJAX/SPA support, and reactive state inspector.

## 📚 References & Advanced
47. [Utilities](47-utilities.md) — Humanize, Minifiers, and Helpers.
48. [Component API](48-component-api.md) — Full reference for Alive Components.
49. [SEO Management](49-seo-management.md) — Titles, Meta tags, and Social sharing.
50. [Tailwind CSS](50-tailwind-css.md) — Integrating and customizing Tailwind.
