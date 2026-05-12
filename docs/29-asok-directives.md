# Asok Directives

Asok includes native reactive directives for building interactive UIs without custom JavaScript. These directives are automatically processed by a lightweight, built-in runtime (~5KB).

### State Management

#### `asok-state` — Component state

Define reactive local state for a component:

```html
<div asok-state="{ count: 0, name: 'Alice' }">
  <p asok-text="'Count: ' + count"></p>
  <p asok-text="'Name: ' + name"></p>
  <button asok-on:click="count++">Increment</button>
</div>
```

State is scoped to the component and its children. Changes trigger automatic re-renders.

#### `$store` — Global state

Access shared state across all components:

```html
<!-- Component 1 -->
<div asok-state="{}">
  <button asok-on:click="$store.theme = 'dark'">Dark Mode</button>
</div>

<!-- Component 2 (updates automatically) -->
<div asok-state="{}" asok-class="$store.theme === 'dark' ? 'bg-black text-white' : ''">
  <span asok-text="'Current theme: ' + $store.theme"></span>
</div>
```

The store uses **dependency tracking** — only components that use a property are updated when it changes (10-20x faster than updating everything).

Access from JavaScript:

```javascript
window.Asok.store.theme = 'dark';
window.Asok.store.user = { name: 'Alice', role: 'admin' };
```

### Display & Visibility

#### `asok-show` / `asok-hide`

Toggle element visibility with `display: none`:

```html
<div asok-state="{ visible: true }">
  <div asok-show="visible">I'm visible</div>
  <div asok-hide="visible">I'm hidden</div>
  <button asok-on:click="visible = !visible">Toggle</button>
</div>
```

#### `asok-text`

Set text content reactively:

```html
<div asok-state="{ count: 0 }">
  <p asok-text="'Count: ' + count"></p>
  <button asok-on:click="count++">+</button>
</div>
```

### Class & Attribute Binding

#### `asok-class` — Dynamic classes

Three syntaxes for maximum flexibility:

```html
<div asok-state="{ isOpen: false, status: 'success' }">
  <!-- 1. Toggle a single class -->
  <div asok-class:active="isOpen">Toggle</div>

  <!-- 2. Conditional expression -->
  <div asok-class="isOpen ? 'text-blue-500 font-bold' : 'text-red-500'">
    Conditional classes
  </div>

  <!-- 3. Object (multiple toggles) -->
  <div asok-class="{ 'active': isOpen, 'disabled': !enabled, 'success': status === 'success' }">
    Multiple classes
  </div>
</div>
```

Perfect for Tailwind CSS with long class lists:

```html
<div asok-class="isOpen ? 'bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm' : 'bg-gray-100'">
  ...
</div>
```

#### `asok-bind:attr`

Bind any HTML attribute:

```html
<div asok-state="{ url: '/page', disabled: false }">
  <a asok-bind:href="url">Link</a>
  <button asok-bind:disabled="disabled">Button</button>
  <input asok-bind:placeholder="'Enter ' + fieldName">
</div>
```

### Forms & Input

#### `asok-model`

Two-way data binding for form inputs:

```html
<div asok-state="{ name: '', email: '' }">
  <input asok-model="name" placeholder="Name">
  <input type="email" asok-model="email" placeholder="Email">

  <p asok-text="'Hello ' + name + '! Your email is ' + email"></p>
</div>
```

Works with:
- Text inputs (`<input type="text">`)
- Checkboxes (`<input type="checkbox">`)
- Radio buttons (`<input type="radio">`)
- Select dropdowns (`<select>`)
- Textareas (`<textarea>`)

### Event Handling

#### `asok-on:event`

Listen to any DOM event:

```html
<div asok-state="{ count: 0 }">
  <button asok-on:click="count++" asok-text="'Clicked ' + count + ' times'"></button>
  <input asok-on:input="count = $event.target.value.length">
  <div asok-on:mouseenter="hovered = true">Hover me</div>
</div>
```

Event modifiers:

```html
<!-- Prevent default -->
<form asok-on:submit.prevent="handleSubmit()">...</form>

<!-- Stop propagation -->
<button asok-on:click.stop="doSomething()">Click</button>

<!-- Debounce (300ms default) -->
<input asok-on:input.debounce-500="search()">

<!-- Key filters -->
<input asok-on:keydown.enter="submit()">
<input asok-on:keydown.escape="close()">

<!-- Outside clicks -->
<div asok-on:click.outside="open = false">...</div>
```

### Conditional Rendering

#### `asok-if` / `asok-elif` / `asok-else`

Conditional rendering (elements are removed from DOM):

```html
<div asok-state="{ role: 'admin', count: 5 }">
  <template asok-if="role === 'admin'">
    <p>Admin panel</p>
  </template>
  <template asok-elif="role === 'user'">
    <p>User dashboard</p>
  </template>
  <template asok-else>
    <p>Guest view</p>
  </template>
</div>
```

### Loops

#### `asok-for`

Iterate over arrays:

```html
<div asok-state="{ items: ['Apple', 'Banana', 'Cherry'] }">
  <ul>
    <template asok-for="item in items">
      <li asok-text="'{item} (index: {index})'"></li>
    </template>
  </ul>
</div>
```

### Data Fetching

#### `asok-fetch` — Declarative HTTP requests

Fetch JSON data automatically:

```html
<!-- Auto-fetch on mount -->
<div asok-state="{ users: null, loading: false, error: null }"
     asok-fetch="/api/users"
     asok-fetch-as="users">

  <div asok-show="loading">Loading...</div>
  <div asok-show="error" asok-text="'Error: ' + error"></div>

  <div asok-show="users">
    <p asok-text="'{users.length} users loaded'"></p>
  </div>
</div>

<!-- Fetch on click -->
<button asok-fetch="/api/products"
        asok-fetch-as="products"
        asok-fetch-on="click">
  Load Products
</button>
```

**Attributes:**
- `asok-fetch="/url"` — URL to fetch (GET request)
- `asok-fetch-as="varname"` — Variable name (default: "data")
- `asok-fetch-on="event"` — Trigger event (default: "load")

Automatically sets `loading` and `error` in the component state.

#### `asok-fetch-async` — Custom async expressions

For more control, use async JavaScript expressions:

```html
<div asok-state="{ data: null, loading: false, error: null }">
  <!-- Single fetch -->
  <button asok-fetch-async="data = await fetch('/api/users').then(r => r.json())">
    Load
  </button>

  <!-- Parallel fetches -->
  <button asok-fetch-async="[users, products] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/products').then(r => r.json())
  ])">
    Load All
  </button>
</div>
```

### Advanced

#### `asok-ref`

Get a reference to an element:

```html
<div asok-state="{}">
  <input asok-ref="emailInput">
  <button asok-on:click="$refs.emailInput.focus()">Focus Email</button>
</div>
```

#### `asok-init`

Run code when component initializes:

```html
<div asok-state="{ time: null }"
     asok-init="time = new Date().toLocaleTimeString()">
  Initialized at: {{ time }}
  <span asok-text="'Initialized at: ' + time"></span>
</div>
```

#### `asok-teleport`

Render content in a different location:

```html
<template asok-teleport="#modal-container">
  <div class="modal">Modal content</div>
</template>

<!-- Elsewhere in the page -->
<div id="modal-container"></div>
```

#### `asok-cloak`

Hide element until directives are initialized (prevents flash of unstyled content):

```html
<style>
  [asok-cloak] { display: none; }
</style>

<div asok-state="{ loaded: false }" asok-cloak>
  <span asok-text="'{message}'"></span>
</div>
```

### Special Variables

Inside directive expressions, you have access to:

| Variable | Description |
|---|---|
| `$store` | Global store (shared across components) |
| `$el` | Current element |
| `$event` | Event object (in event handlers) |
| `$refs` | Object of referenced elements |
| `$nextTick(fn)` | Run function after next DOM update |

### Example: Complete Todo App

```html
<div asok-state="{
  todos: [],
  newTodo: '',
  filter: 'all'
}">
  <!-- Add todo -->
  <form asok-on:submit.prevent="todos.push({text: newTodo, done: false}); newTodo = ''">
    <input asok-model="newTodo" placeholder="What needs to be done?">
    <button type="submit">Add</button>
  </form>

  <!-- Filter -->
  <div>
    <button asok-on:click="filter = 'all'"
            asok-class:active="filter === 'all'">All</button>
    <button asok-on:click="filter = 'active'"
            asok-class:active="filter === 'active'">Active</button>
    <button asok-on:click="filter = 'done'"
            asok-class:active="filter === 'done'">Done</button>
  </div>

  <!-- List -->
  <ul>
    <template asok-for="todo in todos.filter(t =>
      filter === 'all' ||
      (filter === 'active' && !t.done) ||
      (filter === 'done' && t.done)
    )">
      <li asok-class="{ 'line-through': todo.done }">
        <input type="checkbox" asok-model="todo.done">
        <span asok-text="'{todo.text}'"></span>
        <button asok-on:click="todos.splice(index, 1)">×</button>
      </li>
    </template>
  </ul>

  <!-- Stats -->
  <p asok-text="'{todos.filter(t => !t.done).length} items left'"></p>
</div>
```

---
[← Previous: Intelligent Prefetching](28-intelligent-prefetching.md) | [Documentation](README.md) | [Next: Admin Interface →](30-admin-interface.md)
