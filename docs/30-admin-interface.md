# Admin Interface

A Django-style admin interface, auto-generated from your models. Zero config to start, deeply customizable when you need it.

## Quick start

Scaffold a project with admin enabled:

```bash
asok create myapp --admin
cd myapp
asok createsuperuser
asok dev
```

Open http://127.0.0.1:8000/admin and log in.

The `--admin` flag generates a `User` model with an `is_admin` field and registers `Admin(app)` in `wsgi.py`.

## Adding to an existing project

If you decided to add the Admin interface after your project was created, run:

```bash
asok admin --enable
```

This command will:
1. Update `wsgi.py` to register the `Admin` extension.
2. Create `src/models/user.py` with the default `User` model if it doesn't exist.
3. Guide you through the necessary migrations and superuser creation.

### Customization

```python
Admin(app, site_name="codewithmpia", url_prefix="/gestion", favicon="images/logo.svg")
```

| Param | Default | Description |
|---|---|---|
| `site_name` | `"Asok Admin"` | Brand shown in sidebar / page title |
| `url_prefix` | `"/admin"` | URL prefix for all admin routes |
| `favicon` | `None` | Path to your brand logo / tab icon |

#### Smart Asset Resolution

The `favicon` path resolves intelligently based on its location:
- **Internal Assets**: If you use a simple filename like `logo.svg`, the admin uses its built-in internal version.
- **Project Assets**: If you provide a directory path (e.g. `images/logo.svg` or `uploads/brand.png`), the admin resolves it relative to your project's `src/partials/` folder.

This logo is automatically applied as the browser favicon, the sidebar brand icon, and the login page header.

## Authentication

Admin uses `request.login()` and requires the user to have `is_admin = True`. Add the field to your `User` model:

```python
from asok import Model, Field

class User(Model):
    email = Field.String()
    password = Field.Password()
    is_admin = Field.Boolean(default=False)
```

Create the first superuser:

```bash
asok createsuperuser
# or non-interactive:
asok createsuperuser --email=admin@example.com --password=secret
```

> **Session Security**: By default, an admin session lasts for **30 days**. If you want your administrators to re-authenticate more frequently, change the `SESSION_MAX_AGE` value (in seconds) in your `.env` file.

## Roles & Permissions

Asok Admin ships with a granular role-based permission system. Two models are auto-provisioned when you call `Admin(app)`:

- **User** — the auth model (`email`, `password`, `name`, `is_admin`, `totp_enabled`, `created_at`)
- **Role** — grants permissions to users (`name`, `label`, `permissions`, `created_at`)

Linked by a `role_user` pivot table (a user can have any number of roles).

### Permission format

Permissions are comma-separated strings following `<slug>.<verb>`:

- `posts.view`, `posts.edit`, `users.delete`, `assets.export`
- `posts.*` — all verbs on `posts`
- `*` — superuser (bypass all checks)

The available verbs are: `view`, `add`, `edit`, `delete`, `export`.

### Granting access

1. Log in as a superuser (`is_admin = True`) or an existing admin.
2. Go to **Roles** → **New**.
3. Give it a `name` (e.g. `editor`) and a `label` (e.g. `Content Editor`).
4. Tick boxes in the **Permissions** matrix (models × verbs). The "all" column ticks a whole row; the **Superuser** checkbox at the top grants `*`.
5. Save.
6. Go to **Users**, edit the target user, tick the role in the **Roles** section. Save.

The user now sees only the models they have `view` permission on. Each action (add / edit / delete / export) is gated by its corresponding verb.

### Behaviour summary

| User state | Access |
|---|---|
| `is_admin = True` | Full access, bypass all permission checks |
| Has roles with perms | Filtered access based on permissions |
| No roles, `is_admin = False` | Redirected to `/admin/login` |

### `user.can(perm)`

The `User.can()` helper is also available in your own code:

```python
if request.user.can("posts.edit"):
    ...
```

Supports exact match, `<slug>.*` wildcards, and `*` superuser.

### Audit Logs

All changes made via the admin interface are automatically tracked in the `AdminLog` model. This provides a full history of:
- Who made the change
- When it was made
- What fields were changed (with a diff of old vs new values)

You can view the history of any item by clicking the **History** button on its edit page.

## 🔐 Two-Factor Authentication (2FA)

Asok Admin supports TOTP-based 2FA (Google Authenticator, Authy, etc.).

### Enabling 2FA
1. Click your profile in the topbar and go to **My Profile**.
2. Click **Enable 2FA**.
3. Scan the QR code with your authenticator app.
4. Enter the 6-digit verification code to confirm.

Once enabled, every login will require a 6-digit code after the password verification.

### Disabling 2FA
You can disable 2FA from your profile page. This requires confirming your current password for security.

## 👥 Impersonation

Super-admins (`is_admin = True`) can "act as" any other user to troubleshoot issues or verify permissions.

1. Go to the **Users** list.
2. Click the **Impersonate** button (user icon) on the target user's row.
3. You are now acting as that user. A banner will appear at the top of the admin interface.

### Security
- Only real admins with `is_admin = True` can start impersonation.
- Impersonation sessions automatically expire after **1 hour**.
- All actions performed while impersonating are logged under the target user's ID but marked as impersonated in audit logs.
- Click **Stop Impersonation** in the banner to return to your admin account.

## 📁 Media Manager

The Media Manager allows you to manage files uploaded to `src/partials/uploads/`.

### Permissions
Access to the Media Manager is controlled by the `assets` slug:
- `assets.view`: Access the media manager list.
- `assets.add`: Upload new files.
- `assets.delete`: Delete existing files.

### Organization
Files are automatically grouped into subdirectories based on their type:
- **images/**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`
- **pdfs/**: `.pdf`
- **others/**: All other file types

### Usage
You can upload multiple files at once using drag & drop or the file picker. Images feature a live preview and one-click copy of their public URL.

## 🔍 Global Search

The admin interface features a powerful global search (accessible via `Cmd+K` or the search icon in the sidebar).

- **Multi-model**: Searches across all registered models simultaneously.
- **Permission-aware**: Only shows results from models the user has `view` permission on.
- **Customizable**: Control which fields are searchable for each model using `search_fields`.

## 📊 Dashboard Widgets

You can extend the dashboard with custom widgets to show stats, charts, or quick actions.

```python
from asok.admin import Admin
from asok.utils.html import SafeString

admin = Admin(app)

@admin.widget("Recent Sales", size="medium")
def recent_sales(request):
    sales = Sale.query().order_by("-id").limit(5).get()
    html = "<ul>"
    for s in sales:
        html += f"<li>{s.amount}€ - {s.created_at}</li>"
    html += "</ul>"
    return html

# Or return a dict for more control
@admin.widget("System Status", size="small")
def system_status(request):
    return {
        "html": '<div class="text-success">All systems operational</div>',
        "footer": '<a href="/admin/logs">View logs</a>'
    }
```

### Widget Options
- **title**: The display title.
- **size**: `small`, `medium`, or `large`.
- **permission**: Optional `slug.verb` string. The widget will be hidden if the user lacks this permission.

## Per-model configuration

Customize how a model appears in admin by adding a nested `Admin` class:

```python
from asok import Model, Field, ModelAdmin

class Post(Model):
    title = Field.String()
    body = Field.Text()
    slug = Field.Slug(source='title')
    published = Field.Boolean(default=False)
    author_id = Field.ForeignKey('users')
    content = Field.Text(wysiwyg=True) # Rich Text Editor

    author = BelongsTo('users')
    tags = BelongsToMany('tags')

    class Admin(ModelAdmin):
        label = "Posts"
        list_display = ['title', 'author', 'published', 'created_at']
        search_fields = ['title', 'body']
        list_filter = ['published', 'author_id']
        readonly_fields = ['created_at']
        form_exclude = ['slug']  # Hide from create/edit forms
        fieldsets = [
            ('Content', ['title', 'slug', 'body']),
            ('Publishing', ['published', 'author_id']),
        ]
        per_page = 25
        can_delete = True
        actions = ['publish_selected']

    @classmethod
    def publish_selected(cls, ids):
        cls.where('id', 'in', ids).update(published=True)
```

> Use **`asok.ModelAdmin`** as a base class for your inner `Admin` class to get full IDE autocompletion for all configuration options.

```python
from asok import Model, Field, ModelAdmin

class MyModel(Model):
    # ...
    class Admin(ModelAdmin):
        list_display = ["id", "name"]
        # Your IDE will now suggest all available options!
```

### Field visibility control

Control which fields appear in forms:

```python
class Category(Model):
    name = Field.String()
    slug = Field.Slug(populate_from='name')
    created_at = Field.CreatedAt()

    class Admin(ModelAdmin):
        form_exclude = ['slug', 'created_at']  # Completely hidden from forms
        readonly_fields = ['created_at']       # Shown but not editable
```

**Difference:**
- `form_exclude` — Field is **completely hidden** from create/edit forms
- `readonly_fields` — Field is **shown but disabled** (useful for auto-generated fields)

Use `form_exclude` for fields that auto-populate (like slugs) or timestamps. Use `readonly_fields` when you want users to see the value but not change it.

### All options

| Option | Type | Description |
|--------|------|-------------|
| `hidden` | `bool` | Hide this model from admin (`hidden = True`) |
| `slug` | `str` | URL slug (defaults to table name) |
| `label` | `str` | Display name in sidebar |
| `group` | `str` | Group models together in the sidebar |
| `list_display` | `list` | Columns in the list view |
| `search_fields` | `list` | Fields searched by the search box (multi-field OR-LIKE) |
| `list_filter` | `list` | Fields exposed as filters in the sidebar |
| `readonly_fields` | `list` | Fields displayed but not editable |
| `form_exclude` | `list` | Fields to exclude completely from create/edit forms |
| `fieldsets` | `list` | Group fields into labeled cards: `[(label, [fields]), ...]` |
| `per_page` | `int` | Pagination size (default 20) |
| `inlines` | `list` | Related models to display below the form (`['comments', ...]`) |
| `can_add` | `bool` | Allow creation (default `True`) |
| `can_edit` | `bool` | Allow editing (default `True`) |
| `can_delete` | `bool` | Allow deletion (default `True`) |
| `actions` | `list` | Names of `@classmethod`s exposed as bulk actions |

## Display helper

Foreign keys and relations are displayed using the related model's `__str__()` method, falling back to `name`, `title`, `label`, `email`, `username`, `slug`, then `#<id>`.

Define `__str__` to control the display:

```python
class User(Model):
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
```

## Features

- **Search** — multi-field LIKE across `search_fields`
- **Filters** — sidebar filter panel for `list_filter` fields
- **Sort** — click any column header
- **Pagination** — preserves search, filters, and sort
- **Bulk actions** — select rows and delete or run a custom action
- **Soft delete & trash** — restore or permanently delete from the trash view
- **CSV export** — exports the current filtered/sorted view
- **BelongsToMany editor** — checkbox grid for many-to-many relations
- **Rich Text Editor (WYSIWYG)** — supported on `Text` fields with `wysiwyg=True`
- **Inlines** — view related `HasMany` rows below the parent form, with edit links
- **Date / datetime / file pickers** — auto-detected from field types
- **Image preview** — preview uploaded images on the edit form
- **Breadcrumbs** — context-aware navigation
- **Save variants** — Save / Save and continue / Save and add another
- **Dark mode** — toggle in the topbar, persisted in localStorage
- **Empty values** — `—` shown for null/empty cells
- **Boolean badges** — colored Yes/No badges for boolean columns
- **Error pages** — beautiful 403, 404, and 500 error pages with admin design

## Error Pages

The admin interface includes beautifully designed error pages that match the admin theme:

### Built-in Error Pages

- **403 Forbidden** — Access denied with login option
- **404 Not Found** — Page or item not found
- **500 Internal Server Error** — Server error with retry option

All error pages:
- Match the admin theme (light/dark mode support)
- Display contextual icons and messages
- Provide relevant action buttons (Go Back, Dashboard, Retry, Login)
- Are fully internationalized (English, French, Spanish)
- Show helpful messages without exposing sensitive information

### Custom Error Messages

To customize error messages in your admin extensions, use the `_render_error()` method:

```python
from asok.admin import Admin

class MyAdmin(Admin):
    def custom_check(self, request):
        if not some_condition:
            return self._render_error(
                request,
                403,
                self.t(request, "Custom Access Denied"),
                self.t(request, "You need special permission for this action."),
            )
```

The error page template automatically handles:
- Error code badge display
- Appropriate icons per error type
- Contextual action buttons
- Multi-language support

## Templates and static files

Templates and CSS/JS are bundled inside the `asok` package. To override a template, drop a file with the same name into `src/templates/admin/` (e.g., `src/templates/admin/list.html`) — your template wins.

The admin CSS is self-contained (no Tailwind required) and supports light/dark themes via CSS variables.

---
[← Previous: Asok Directives](29-asok-directives.md) | [Documentation](README.md) | [Next: API Development →](31-api-development.md)
