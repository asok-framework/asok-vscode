# Sessions

Server-side sessions with signed cookie IDs.

## Usage

```python
from asok import Request

def render(request: Request):
    # Read
    username = request.session.get("username")

    # Write
    request.session["username"] = "alice"
    request.session["cart"] = [1, 2, 3]

    return request.html("page.html")
```

Sessions are lazy-loaded on first access. Modified sessions are automatically saved when the response is sent.

## Configuration

| Key | Default | Description |
|---|---|---|
| `SESSION_BACKEND` | `"memory"` | `"memory"` or `"file"` |
| `SESSION_PATH` | `".sessions"` | Directory for file backend |
| `SESSION_TTL` | `86400` | Session lifetime in seconds |

### File backend

```python
app.config["SESSION_BACKEND"] = "file"
app.config["SESSION_PATH"] = ".sessions"
```

Sessions are stored as JSON files in the specified directory.

## How it works

1. A signed cookie (`asok_sid`) identifies the session
2. Session data is stored server-side (memory or file)
3. On first `request.session` access, data is loaded from the store
4. If `session.modified` is `True` at response time, data is saved back

## Session API

`request.session` behaves like a regular `dict`:

```python
request.session["key"] = "value"
request.session.get("key", "default")
del request.session["key"]
request.session.pop("key")
request.session.clear()
```

All mutating operations automatically set `session.modified = True`.

## Production Persistence

> In production environments using multi-worker servers like **Gunicorn**, you **must** use the `file` backend. 
> 
> The default `memory` backend stores sessions in the RAM of the specific worker process. Since requests are distributed across multiple workers, a user will "lose" their session as soon as their request is handled by a different worker.

### Configuring for Gunicorn

To ensure persistence across workers, configure the `file` backend in your `wsgi.py` (before application startup):

```python
app.config["SESSION_BACKEND"] = "file"
app.config["SESSION_PATH"] = "/run/asok/sessions" # Using SystemD RuntimeDirectory
```

For RHEL/AlmaLinux servers, see the [Deployment](39-deployment.md) guide for handling SELinux permissions.

---
[← Previous: Advanced Authentication](18-advanced-authentication.md) | [Documentation](README.md) | [Next: Security Headers →](20-security-headers.md)
