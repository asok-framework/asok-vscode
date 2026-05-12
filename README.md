<p align="center">
  <img src="https://raw.githubusercontent.com/asok-framework/asok-vscode/main/resources/logo.png" alt="Asok Framework Logo" width="150" />
</p>

# Asok VS Code Extension

**Asok VS Code** is the official rapid development toolkit for the **Asok Framework**. It brings the power and speed of Asok directly into your editor with specialized snippets, intelligent autocompletion, and integrated CLI commands.

- 🌍 **Website**: [asok-framework.com](https://asok-framework.com/)
- 🐙 **GitHub (Framework)**: [asok-framework/asok](https://github.com/asok-framework/asok)
- 📺 **YouTube Channel**: [youtube.com](http://www.youtube.com)

---

## 🚀 Getting Started

1. **Install the Extension**: Install this extension from the VS Code Marketplace.
2. **Open an Asok Project**: Open any folder containing an Asok project.
3. **Language Detection**: The extension automatically recognizes `.html` and `.asok` files as **Asok HTML**.
4. **Enable Emmet**: On first launch, a notification will ask if you want to enable Emmet. Click **"Enable"** to get full Emmet support in your templates.

---

## ✨ Key Features

### 🔍 Exhaustive Code Intelligence
Full IntelliSense, syntax highlighting, and hover documentation for all Asok features.

#### **Reactive Directives (`asok-*`)**

| Directive | Example | Description |
|---|---|---|
| `asok-state` | `asok-state="{ count: 0 }"` | Define reactive local state. |
| `asok-text` | `asok-text="name"` | Update element text content reactively. |
| `asok-show` | `asok-show="isOpen"` | Toggle visibility (display: none). |
| `asok-hide` | `asok-hide="isOpen"` | Hide element if expression is truthy. |
| `asok-class` | `asok-class="{ 'active': isOk }"` | Dynamic class binding (string or object). |
| `asok-model` | `asok-model="email"` | Two-way data binding for form inputs. |
| `asok-on` | `asok-on:click="doSomething"` | Listen to DOM events with modifiers (.prevent, .stop). |
| `asok-for` | `<template asok-for="item in items">` | Iterate over arrays in the browser. |
| `asok-if` | `<template asok-if="isAdmin">` | Conditional rendering (removes element from DOM). |
| `asok-elif` | `<template asok-elif="isUser">` | Else-if condition for `asok-if`. |
| `asok-else` | `<template asok-else>` | Else condition for `asok-if`. |
| `asok-fetch` | `asok-fetch="/api/users"` | Declarative HTTP GET request. |
| `asok-ref` | `asok-ref="myInput"` | Reference element via `$refs`. |
| `asok-init` | `asok-init="initTask()"` | Run code when element initializes. |
| `asok-transition` | `asok-transition="fade 300"` | Apply animations during updates (fade, slide, scale). |
| `asok-cloak` | `asok-cloak` | Hide element until the Asok runtime is ready. |
| `asok-teleport` | `<template asok-teleport="#modals">` | Render content in a different DOM location. |

#### **Live Updates (`data-*`)**

| Attribute | Example | Description |
|---|---|---|
| `data-block` | `data-block="results"` | Target a specific template block to refresh. |
| `data-trigger` | `data-trigger="every 5s"` | Trigger update on event or polling interval. |
| `data-swap` | `data-swap="outerHTML"` | Swap strategy (innerHTML, beforebegin, etc.). |
| `data-subscribe` | `data-subscribe="model:Post:1"` | Real-time update when model changes in DB. |
| `data-indicator` | `data-indicator="#spinner"` | Show loading state during update. |

#### **Reactive Triggers (`ws-*`)**

| Attribute | Example | Description |
|---|---|---|
| `ws-click` | `ws-click="increment"` | Trigger server method on click via WebSocket. |
| `ws-input` | `ws-input="search"` | Trigger server method on input value change. |
| `ws-submit` | `ws-submit="saveForm"` | Trigger server method on form submission. |

#### **Template Reference**
- **Filters**: `upper`, `lower`, `capitalize`, `title`, `truncate`, `replace`, `join`, `default`, `striptags`, `length`, `date`, `pluralize`, `abs`, `tojson`, `first`, `last`, `safe`, `escape`, `e`, `time_ago`, `filesize`, `intcomma`, `duration`, `decode_base64`.
- **Tests**: `defined`, `undefined`, `none`, `true`, `false`, `even`, `odd`, `string`, `number`, `boolean`, `integer`, `float`, `sequence`, `mapping`, `iterable`, `lower`, `upper`.

---

### 🛠️ Integrated CLI Commands
Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) and search for **"Asok"**:

| Command | Description |
|---|---|
| `Asok: Start Dev Server` | Launch the local development server. |
| `Asok: Run Migrations` | Apply all pending database migrations. |
| `Asok: Migration Status` | Check the current state of database migrations. |
| `Asok: Rollback Last Migration` | Revert the most recent database change. |
| `Asok: Seed Database` | Populate the database with initial seed data. |
| `Asok: List Routes` | Display all registered application URLs. |
| `Asok: Create Superuser` | Create an administrative user account. |
| `Asok: Make Model` | Scaffold a new database model class. |
| `Asok: Make Page` | Create a new page template and route handler. |
| `Asok: Make Component` | Scaffold a new reactive (Live) component. |
| `Asok: Make Middleware` | Create a new request/response middleware. |
| `Asok: Make Migration` | Generate a new migration file based on model changes. |

---

### ⚡ Power User Snippets

#### **Template Snippets (HTML)**
| Prefix | Description | Output |
|---|---|---|
| `as-var` | Variable interpolation | `{{ $1 }}` |
| `as-if` | Conditional block | `{% if ... %}` |
| `as-for` | Loop block | `{% for ... %}` |
| `as-with` | Scoped variables | `{% with ... %}` |
| `as-set` | Assignment | `{% set ... %}` |
| `asok-if` | Browser condition | `<template asok-if="...">` |
| `asok-for` | Browser loop | `<template asok-for="...">` |
| `asok-state` | Component state | `asok-state="{ ... }"` |

#### **Python Snippets**
| Prefix | Description | Output |
|---|---|---|
| `as-route` | Route handler | Complete boilerplate with `render(request)` |
| `as-model` | Database model | `class MyModel(Model): ...` |
| `as-field-*` | Model fields | `name = Field.String(...)`, `Field.Integer(...)`, etc. |
| `as-rel-*` | Model relations | `Relation.BelongsTo(...)`, `HasMany(...)`, etc. |
| `as-form` | Form definition | `form = Form({ ... })` |
| `as-action` | Form action | `def action_name(request): ...` |
| `as-api` | API endpoint | `@api()` decorator + handler |
| `as-component` | Live component | `class MyComp(Component): ...` |
| `as-schema` | Data schema | `class MySchema(Schema): ...` |

---

## 📖 Requirements
- **Asok Framework**: Make sure you have `asok` installed in your environment to use the CLI commands.
- **VS Code**: Version 1.80.0 or higher.

---

## 🤝 Contributing
Found a bug or have a feature request? Please open an issue on our [GitHub Repository](https://github.com/asok-framework/asok-vscode).

**Happy Coding with Asok!** 🚀
