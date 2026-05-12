# Static Versioning

In production, `static()` appends a content hash to static URLs for cache busting.

## Usage

In templates:

```html
<link rel="stylesheet" href="{{ static('css/app.css') }}">
```

**Development** output: `/css/app.css`

**Production** output: `/css/app.css?v=a1b2c3d4`

The hash is the first 8 characters of the file's MD5 digest. It's computed once and cached for the lifetime of the process.

The query string (`?v=...`) is ignored by the static file server since it uses `PATH_INFO`, not `QUERY_STRING`.

## No configuration needed

Static versioning is automatic — enabled in production (`DEBUG=false`), disabled in development.

---
[← Previous: Optimization](42-optimization.md) | [Documentation](README.md) | [Next: Production Build System →](44-production-build.md)
