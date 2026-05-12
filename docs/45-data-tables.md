# Data Tables

Asok provides a powerful, professional `Table` component for rendering data with built-in support for sorting, searching, pagination, and bulk actions.

## Basic Usage

The `Table` component can auto-detect columns from a `Query` object, a list of Models, or a list of dictionaries.

```python
from asok import Table

def render(request):
    users = User.all()
    # Simple table from a list of objects
    table = Table(users)
    return request.html("users.html", table=table)
```

In your template:
```html
<div class="card">
    {{ table }}
</div>
```

## Reactive Mode

By calling `.reactive()`, the table transforms into a modern client-side interactive component. Sorting, filtering, and pagination happen instantly without reloading the page.

```python
table = Table(User.all()).reactive().paginate(10)
```

### Features of Reactive Tables:
- **Instant Search**: Filters rows as you type.
- **Client-side Sorting**: Click headers to sort ascending/descending.
- **Bulk Selection**: Integrated checkboxes to select multiple rows.
- **SPA-like Pagination**: Smooth page transitions.
- **Dynamic CSS**: Professional enterprise styling with hover effects and glassmorphism.

## Customizing Columns

You can explicitly define and customize columns using `TableColumn`.

```python
from asok import Table, TableColumn

table = Table(User.all()).reactive()
table.columns = [
    TableColumn("name", label="Full Name", sortable=True),
    TableColumn("email", label="Email Address"),
    TableColumn("status", label="Status", template='''
        <span class="badge {{ item.status == 'active' ? 'bg-green' : 'bg-red' }}">
            {{ item.status }}
        </span>
    ''')
]
```

### Column Options:
- `label`: Header text.
- `sortable`: Enables clicking the header to sort in reactive mode.
- `template`: Custom HTML for the cell. Use `{{ item.field }}` syntax for dynamic values.

## Actions and AJAX

Add action buttons to each row. When using `ajax=True`, the action is performed in the background, and the row is automatically removed or updated if the server returns a success code.

```python
table.actions([
    ("Edit", "/users/{id}/edit", "edit"),
    ("Delete", "/users/{id}/delete", "trash", {
        "ajax": True, 
        "method": "DELETE", 
        "confirm": "Really delete this user?"
    })
])
```

### Bulk Actions
If you define a "Delete" action, it automatically enables a **Bulk Actions Bar** at the top of the table when multiple items are selected. Clicking the bulk delete will send a POST request with the list of selected IDs to `/users/bulk-delete`.

## Configuration API

| Method | Description |
|---|---|
| `.reactive()` | Enables client-side interactivity. |
| `.paginate(n)` | Sets number of items per page. |
| `.actions([...])` | Adds row-level buttons. |
| `.searchable([...])` | Defines which fields are searchable (default: all visible). |
| `.class_(str)` | Adds CSS classes to the table wrapper. |

---
[← Previous: Production Build System](44-production-build.md) | [Documentation](README.md) | [Next: Developer Toolbar (Asok Console) →](46-developer-toolbar.md)
